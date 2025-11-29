import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      throw new Error('Unauthorized')
    }

    console.log('User authenticated:', user.id)

    const { rewardId, classId } = await req.json()

    if (!rewardId || !classId) {
      throw new Error('Missing rewardId or classId')
    }

    console.log('Purchase request:', { rewardId, classId, studentId: user.id })

    // Get reward details
    const { data: reward, error: rewardError } = await supabaseClient
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .single()

    if (rewardError || !reward) {
      console.error('Reward fetch error:', rewardError)
      throw new Error('Reward not found')
    }

    console.log('Reward found:', reward.title, 'Cost:', reward.points_cost)

    // Check purchase limit
    if (reward.purchase_limit_type === 'once' || reward.purchase_limit_type === 'custom') {
      const { data: existingPurchases, error: purchasesError } = await supabaseClient
        .from('reward_purchases')
        .select('id')
        .eq('student_id', user.id)
        .eq('reward_id', rewardId)

      if (purchasesError) {
        console.error('Purchases check error:', purchasesError)
        throw new Error('Error checking purchase history')
      }

      const purchaseCount = existingPurchases?.length || 0

      if (reward.purchase_limit_type === 'once' && purchaseCount >= 1) {
        throw new Error('You have already purchased this reward')
      }

      if (reward.purchase_limit_type === 'custom' && reward.purchase_limit_count) {
        if (purchaseCount >= reward.purchase_limit_count) {
          throw new Error(`Purchase limit reached (${reward.purchase_limit_count} times)`)
        }
      }
    }

    // Calculate student's current points
    const { data: transactions, error: transactionsError } = await supabaseClient
      .from('points_transactions')
      .select('points')
      .eq('student_id', user.id)
      .eq('class_id', classId)

    if (transactionsError) {
      console.error('Transactions fetch error:', transactionsError)
      throw new Error('Error fetching points')
    }

    const totalPoints = transactions?.reduce((sum, t) => sum + t.points, 0) || 0
    console.log('Student total points:', totalPoints)

    if (totalPoints < reward.points_cost) {
      throw new Error('Not enough points')
    }

    // Calculate expiration if recurring
    let expiresAt = null
    if (reward.reward_type === 'recurring' && reward.duration_days) {
      const expiration = new Date()
      expiration.setDate(expiration.getDate() + reward.duration_days)
      expiresAt = expiration.toISOString()
    }

    // Check if this exact purchase already exists (idempotency check)
    const { data: existingPurchase } = await supabaseClient
      .from('reward_purchases')
      .select('id')
      .eq('reward_id', rewardId)
      .eq('student_id', user.id)
      .eq('class_id', classId)
      .eq('status', 'pending')
      .gte('purchased_at', new Date(Date.now() - 5000).toISOString()) // Within last 5 seconds
      .maybeSingle()

    if (existingPurchase) {
      console.log('Duplicate purchase detected, returning existing:', existingPurchase.id)
      return new Response(
        JSON.stringify({ success: true, purchase: existingPurchase }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Create purchase
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('reward_purchases')
      .insert({
        reward_id: rewardId,
        student_id: user.id,
        class_id: classId,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Purchase creation error:', purchaseError)
      throw new Error('Error creating purchase')
    }

    console.log('Purchase created:', purchase.id)

    // Deduct points using service role
    const { error: pointsError } = await supabaseClient
      .from('points_transactions')
      .insert({
        student_id: user.id,
        teacher_id: reward.created_by,
        class_id: classId,
        points: -reward.points_cost,
        reason: `Purchased: ${reward.title}`,
      })

    if (pointsError) {
      console.error('Points deduction error:', pointsError)
      // Rollback: delete the purchase
      await supabaseClient.from('reward_purchases').delete().eq('id', purchase.id)
      throw new Error('Error deducting points')
    }

    console.log('Points deducted successfully')

    // Get all teachers in the class (mentor + co-teachers)
    const { data: teachers, error: teachersError } = await supabaseClient
      .from('class_members')
      .select('user_id')
      .eq('class_id', classId)
      .eq('is_teacher', true)

    if (teachersError) {
      console.error('Teachers fetch error:', teachersError)
    }

    // Get class mentor too
    const { data: classData, error: classError } = await supabaseClient
      .from('classes')
      .select('mentor_id')
      .eq('id', classId)
      .single()

    if (classError) {
      console.error('Class fetch error:', classError)
    }

    // Create messages for all teachers (deduplicated)
    const teacherIds = new Set<string>()
    if (classData?.mentor_id) {
      teacherIds.add(classData.mentor_id)
    }
    if (teachers) {
      teachers.forEach((t: any) => teacherIds.add(t.user_id))
    }

    console.log('Creating messages for teachers:', Array.from(teacherIds))

    // Create messages for each teacher, checking for duplicates per teacher
    for (const teacherId of teacherIds) {
      // Check if message already exists for this specific teacher and purchase
      const { data: existingMessage } = await supabaseClient
        .from('messages')
        .select('id')
        .eq('reward_purchase_id', purchase.id)
        .eq('teacher_id', teacherId)
        .maybeSingle()

      if (existingMessage) {
        console.log('Message already exists for teacher:', teacherId, 'skipping')
        continue
      }

      const { error: messageError } = await supabaseClient.from('messages').insert({
        class_id: classId,
        teacher_id: teacherId,
        student_id: user.id,
        reward_purchase_id: purchase.id,
        message_type: 'reward_purchase',
        message: `Student purchased ${reward.category} reward: ${reward.title}`,
      })

      if (messageError) {
        console.error('Message creation error for teacher:', teacherId, messageError)
      } else {
        console.log('Message created successfully for teacher:', teacherId)
      }
    }

    return new Response(
      JSON.stringify({ success: true, purchase }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in purchase-reward function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
