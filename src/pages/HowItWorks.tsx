import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Star, Award, Gift, Users, Zap, Shield, Heart, ArrowRight, Sparkles, 
  School, UserPlus, LogIn, Trophy, ShoppingBag, TrendingUp, Settings,
  CheckCircle, BookOpen, Target, Palette
} from "lucide-react";

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              VasaBonus
            </span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => navigate("/contact")}>
              Contact
            </Button>
            <Button variant="ghost" onClick={() => navigate("/auth?mode=login")}>
              Log in
            </Button>
            <Button onClick={() => navigate("/auth?mode=signup")} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              Get started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <BookOpen className="w-4 h-4" />
            Complete Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            How{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              VasaBonus
            </span>{" "}
            Works
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A complete guide for teachers and students to get the most out of the reward system
          </p>
        </div>
      </section>

      {/* For Teachers Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <School className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">For Teachers</h2>
          </div>

          <div className="grid gap-6">
            {/* Step 1: Create Account */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-green-500" />
                      Create Your Account
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Sign up for a free account and select "Teacher" as your role. You can join an existing school using a school code, or request to create a new school.
                    </p>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-700">
                        <strong>Tip:</strong> If your school already uses VasaBonus, ask another teacher for the school code to join.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Create Class */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-500" />
                      Create Your Class
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Create a new class with a name (e.g., "9D" or "Math 101"). Each class gets a unique 6-character code that students use to join.
                    </p>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-700">
                        <strong>Tip:</strong> Share the class code on the board or send it via your school's communication platform.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Give Points */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-500" />
                      Give Points to Students
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Award points to students for positive behavior, good work, helping others, or any other reason you choose. You can give points to individuals or multiple students at once.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Example Reasons:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Great homework</li>
                          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Helping a classmate</li>
                          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Good participation</li>
                          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Leadership</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Point Amounts:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Small recognition: 5-10 points</li>
                          <li>• Good work: 15-25 points</li>
                          <li>• Outstanding effort: 30-50 points</li>
                          <li>• Custom amounts for anything</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 4: Create Rewards */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-green-500" />
                      Set Up the Reward Store
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Create rewards that students can purchase with their points. Rewards can be anything from homework passes to special privileges.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Reward Ideas:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Homework pass (100 points)</li>
                          <li>• Extra credit (75 points)</li>
                          <li>• Choose your seat (50 points)</li>
                          <li>• Music during work (30 points)</li>
                          <li>• Lunch with teacher (200 points)</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-700">
                          <strong>Tip:</strong> Set reward quantities to limit how many times each can be purchased. Some rewards can be unlimited!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 5: Run Campaigns */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">5</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-green-500" />
                      Create Bonus Campaigns (Optional)
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Run special campaigns with point multipliers to boost engagement. Great for special events, exam periods, or behavior incentives.
                    </p>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-yellow-700">
                        <strong>Example:</strong> "Kindness Week" - 2x points for all acts of kindness from Monday to Friday!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Students Section */}
      <section className="bg-gradient-to-br from-purple-900 to-blue-900 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">For Students</h2>
            </div>

            <div className="grid gap-6">
              {/* Step 1: Join Class */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-400/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <LogIn className="w-5 h-5 text-purple-300" />
                      Join Your Class
                    </h3>
                    <p className="text-purple-200">
                      Create an account and select "Student" as your role. Enter the class code your teacher gave you to join the class.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Earn Points */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-400/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-300" />
                      Earn Points
                    </h3>
                    <p className="text-purple-200 mb-3">
                      Earn points by doing good work, being helpful, participating in class, and being kind to others. Your teacher will award points when they notice your positive actions.
                    </p>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-sm text-purple-200">
                        <strong className="text-white">Pro tip:</strong> You can see your points history to track how you've earned points over time!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Reach New Tiers */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-400/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-300" />
                      Level Up Through Tiers
                    </h3>
                    <p className="text-purple-200 mb-3">
                      As you earn more total points, you'll unlock new tiers with special benefits:
                    </p>
                    <div className="grid md:grid-cols-4 gap-3">
                      <div className="bg-gradient-to-br from-gray-400/20 to-gray-600/20 rounded-lg p-3 text-center">
                        <Shield className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                        <p className="text-white font-semibold text-sm">Basic</p>
                        <p className="text-purple-300 text-xs">0+ pts</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-300/20 to-gray-400/20 rounded-lg p-3 text-center">
                        <Shield className="w-6 h-6 text-gray-200 mx-auto mb-1" />
                        <p className="text-white font-semibold text-sm">Silver</p>
                        <p className="text-purple-300 text-xs">50+ pts</p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-lg p-3 text-center">
                        <Shield className="w-6 h-6 text-yellow-300 mx-auto mb-1" />
                        <p className="text-white font-semibold text-sm">Gold</p>
                        <p className="text-purple-300 text-xs">200+ pts</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-400/20 to-red-600/20 rounded-lg p-3 text-center">
                        <Shield className="w-6 h-6 text-red-300 mx-auto mb-1" />
                        <p className="text-white font-semibold text-sm">Ruby</p>
                        <p className="text-purple-300 text-xs">500+ pts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Buy Rewards */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-400/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-purple-300" />
                      Buy Rewards
                    </h3>
                    <p className="text-purple-200">
                      Visit the Rewards tab to see what's available in your class store. Use your points to purchase rewards! Your teacher will then fulfill the reward.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5: Customize Avatar */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-400/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">5</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-300" />
                      Customize Your Avatar
                    </h3>
                    <p className="text-purple-200">
                      As you reach higher tiers, you'll unlock more avatar customization options! Change your skin, hair, eyes, accessories, background, and more.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 6: Gift Points */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-400/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">6</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-300" />
                      Gift Points to Classmates
                    </h3>
                    <p className="text-purple-200">
                      Want to thank a classmate? You can gift some of your points to other students in your class. It's a great way to show appreciation!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="grid gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Is VasaBonus free?</h3>
                <p className="text-gray-600">Yes! VasaBonus is completely free for teachers and students.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Can students see each other's points?</h3>
                <p className="text-gray-600">Students can see a class ranking, but the exact points of other students may be limited depending on how the class is set up.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Can a teacher manage multiple classes?</h3>
                <p className="text-gray-600">Yes! Teachers can create and manage as many classes as they need, each with their own rewards and points system.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">What happens when a student buys a reward?</h3>
                <p className="text-gray-600">When a student purchases a reward, the teacher gets a notification in their "Pending Rewards" section. The teacher can then fulfill the reward and mark it as complete.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Can points be taken away?</h3>
                <p className="text-gray-600">Yes, teachers can also remove points if needed, with a reason for the deduction.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-purple-100 to-blue-100 py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Create a free account today and start motivating your students with VasaBonus.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth?mode=signup")}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg px-10 py-6"
              >
                Create free account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/contact")}
                className="text-lg px-10 py-6"
              >
                <School className="w-5 h-5 mr-2" />
                Implement at School
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">VasaBonus</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm">
                Created by students at Vasa International School of Stockholm
              </p>
              <p className="text-sm mt-1">
                © {new Date().getFullYear()} VasaBonus. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks;
