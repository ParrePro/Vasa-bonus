import { GuideStep } from "./SmartGuideOverlay";

export const givePointsSmartGuide: GuideStep[] = [
  {
    id: "step-1",
    title: "📚 Welcome to Give Points Guide",
    instruction:
      "Let's learn how to give points to your students. Navigate to your classes and click on the class that contains the student you want to give points to.",
    waitFor: {
      type: "navigation",
      value: "/teacher/class/",
    },
  },
  {
    id: "step-2",
    title: "🎯 Select Your Student",
    instruction:
      "Great! You're in the class. Now scroll down and find the student you want to give points to. Click on that student.",
    waitFor: {
      type: "element-click",
      value: "[data-guide='student-select']",
    },
  },
  {
    id: "step-3",
    title: "⭐ Give Points with a Reason",
    instruction:
      "Perfect! Now you can see the student details. Click on a reason button (like 'Good Behavior', 'Great Assignment') or 'Custom Points' to give points. Clicking the reason will immediately award the points!",
    waitFor: {
      type: "event",
      value: "points-given",
    },
  },
  {
    id: "step-4",
    title: "🎉 Success!",
    instruction:
      "Congratulations! You've successfully given points to a student. The points are now added to their account. You can give points to more students or close this guide.",
    position: "center",
  },
];

export const createRewardSmartGuide: GuideStep[] = [
  {
    id: "step-1",
    title: "🎁 Welcome to Create Reward Guide",
    instruction:
      "Let's create a reward that students can redeem with their points. Navigate to a class first by clicking on it.",
    waitFor: {
      type: "navigation",
      value: "/teacher/class/",
    },
  },
  {
    id: "step-2",
    title: "🏆 Find Rewards Section",
    instruction:
      "Great! You're in a class. Now look for the 'Rewards' tab at the top and click on it.",
    waitFor: {
      type: "element-click",
      value: "[data-guide='rewards-tab']",
    },
  },
  {
    id: "step-3",
    title: "➕ Create New Reward",
    instruction:
      "Now click the 'Add Reward' button to start creating a new reward for your students.",
    waitFor: {
      type: "element-click",
      value: "[data-guide='add-reward-button']",
    },
  },
  {
    id: "step-4",
    title: "📝 Fill in Reward Basics",
    instruction:
      "A form will appear. Fill in the reward title (e.g., 'Homework Pass', 'Extra Recess Time'), description (what it includes), and how many points it costs. Then click 'Next' to continue.",
    waitFor: {
      type: "custom",
    },
  },
  {
    id: "step-5",
    title: "🏷️ Choose Reward Category",
    instruction:
      "Select which type of reward this is:\n\n🎁 Tangible: Physical items students get once and keep forever (sticker, pencil, certificate to take home)\n\n🎟️ One-Time Privilege: Something students get once and can use/claim later (leave school early, borrow something special, skip homework once)\n\n✨ Symbolic: No teacher action needed - students get an automatic privilege for a longer period (extra points tomorrow, special role for a week, access to something special)",
    waitFor: {
      type: "custom",
    },
  },
  {
    id: "step-6",
    title: "⏳ Reward Duration Type",
    instruction:
      "Choose how long this reward benefit lasts:\n\n📅 Short-term: Reward is good for a brief period\n📆 Long-term: Reward is good for an extended period",
    waitFor: {
      type: "custom",
    },
  },
  {
    id: "step-7",
    title: "🔄 Set Purchase Limits",
    instruction:
      "Choose how many times students can purchase this reward:\n\n• Once: Limited supply - students can only get this reward once\n• Unlimited: Always available - students can get it multiple times\n• Custom: Set a specific number (e.g., 3 times maximum per student)",
    waitFor: {
      type: "custom",
    },
  },
  {
    id: "step-8",
    title: "🎨 Add Image (Optional)",
    instruction:
      "You can upload an image to make the reward more appealing and exciting for students. This image will show in their rewards catalog. Click 'Next' when ready to continue (this step is optional).",
    waitFor: {
      type: "custom",
    },
  },
  {
    id: "step-9",
    title: "📅 Set Availability Period",
    instruction:
      "Choose when this reward is visible and available to students:\n\n• Always Available: Reward is shown to students at all times\n• Limited Time: Set specific dates when the reward is available\n• Schedule for Later: Set dates in advance so the reward shows up automatically on specific dates",
    waitFor: {
      type: "custom",
    },
  },
  {
    id: "step-10",
    title: "👨‍🏫 Select Teachers (Optional)",
    instruction:
      "Choose which teachers can approve or fulfill this reward request. You can:\n\n• Leave empty: Only developers can approve\n• Select specific teachers: Those teachers + developers can approve\n\nYou can edit this anytime later.",
    waitFor: {
      type: "custom",
    },
  },
  {
    id: "step-11",
    title: "🎯 Add to Multiple Classes (Optional)",
    instruction:
      "You can optionally add this same reward to other classes. This saves time if you use the same rewards across multiple classes. Then click 'Create Reward' to finish!",
    waitFor: {
      type: "element-click",
      value: "[data-guide='create-reward-submit']",
    },
  },
  {
    id: "step-12",
    title: "🎉 Reward Created!",
    instruction:
      "Excellent! Your reward is now live. Students can see it in their rewards catalog and start earning points to redeem it.",
    position: "center",
  },
];

export const createCampaignSmartGuide: GuideStep[] = [
  {
    id: "step-1",
    title: "🚀 Welcome to Campaign Guide",
    instruction:
      "Let's create a campaign! Campaigns are special events that boost point rewards for a limited time. First, navigate to a class.",
    waitFor: {
      type: "navigation",
      value: "/teacher/class/",
    },
  },
  {
    id: "step-2",
    title: "📊 Find Campaigns Section",
    instruction:
      "Great! You're in a class. Look for the 'Campaigns' tab at the top and click on it.",
    waitFor: {
      type: "element-click",
      value: "[data-guide='campaigns-tab']",
    },
  },
  {
    id: "step-3",
    title: "➕ Create New Campaign",
    instruction:
      "Perfect! Now click the 'Create Campaign' button to start building your campaign.",
    waitFor: {
      type: "element-click",
      value: "[data-guide='add-campaign-button']",
    },
  },
  {
    id: "step-4",
    title: "📝 Campaign Title & Description",
    instruction:
      "Fill in the campaign title (e.g., 'Reading Week', 'Homework Hero Challenge') and a description explaining what the campaign is about and why students should participate. Then click 'Next' to continue.",
    waitFor: {
      type: "custom",
    },
  },
  {
    id: "step-5",
    title: "⚙️ Choose Campaign Type",
    instruction:
      "Select 'Points Multiplier' to multiply all points earned (e.g., 2x = double points), or 'Set Points Reward' to add a flat bonus amount (e.g., +50 points).",
    waitFor: {
      type: "element-click",
      value: "[data-guide='campaign-type-multiplier'], [data-guide='campaign-type-set']",
    },
  },
  {
    id: "step-6",
    title: "📈 Multiplier Explained",
    instruction:
      "If you chose Multiplier: Set a value like 1.5x or 2x. This means students earn 1.5 or 2 times the normal points. Example: If a task normally gives 10 points, with a 2x multiplier they get 20 points.",
    waitFor: {
      type: "element-click",
      value: "[data-guide='campaign-multiplier-input']",
    },
  },
  {
    id: "step-7",
    title: "💰 Bonus Points Explained",
    instruction:
      "If you chose Set Points: Enter a fixed bonus (e.g., 50). Every qualifying action during the campaign gives students 50 extra points, regardless of the normal amount.",
    waitFor: {
      type: "element-click",
      value: "[data-guide='campaign-points-input']",
    },
  },
  {
    id: "step-8",
    title: "⏱️ Set Duration",
    instruction:
      "Choose how long the campaign lasts: Quick (2 min for testing), Weekly, Monthly, Yearly, Custom days, or Unlimited. Pick what makes sense for your campaign.",
    waitFor: {
      type: "element-click",
      value: "[data-guide='campaign-duration']",
    },
  },
  {
    id: "step-9",
    title: "🔁 Max Participations",
    instruction:
      "Set a limit on how many times each student can earn bonus points: 'Once' (one time only), 'Unlimited' (as many times as they complete actions), or 'Custom' (set a specific number like 3 times).",
    waitFor: {
      type: "element-click",
      value: "[data-guide='campaign-max-participations']",
    },
  },
  {
    id: "step-10",
    title: "📅 Schedule Campaign (Optional)",
    instruction:
      "You can set specific start and end dates for when the campaign runs. This lets you schedule campaigns in advance or have them start/stop automatically. Then click 'Next' when ready.",
    waitFor: {
      type: "custom",
    },
  },
  {
    id: "step-11",
    title: "🎨 Add Campaign Image (Optional)",
    instruction:
      "Upload an image to make your campaign more visually appealing and exciting for students. Good images increase engagement!",
    waitFor: {
      type: "element-click",
      value: "[data-guide='campaign-image']",
    },
  },
  {
    id: "step-12",
    title: "👨‍🏫 Select Teachers (Optional)",
    instruction:
      "Choose which teachers can approve or reject student participation in this campaign. You can:\n\n• Leave empty: Only developers can approve/reject\n• Select specific teachers: Those teachers + developers can approve/reject\n\nYou can edit this anytime later.",
    waitFor: {
      type: "custom",
    },
  },
  {
    id: "step-13",
    title: "✅ Create the Campaign",
    instruction:
      "Click 'Create Campaign' to launch your campaign. It will be active immediately and students will see the bonus points when they complete actions.",
    waitFor: {
      type: "element-click",
      value: "[data-guide='create-campaign-submit']",
    },
  },
  {
    id: "step-14",
    title: "🎯 Campaign Best Practices",
    instruction:
      "💡 Tips: Use multipliers for general motivation (before exams, month-long challenges). Use set points for specific actions (homework, reading). Short campaigns create urgency!",
    waitFor: {
      type: "custom",
    },
  },
  {
    id: "step-15",
    title: "🎉 Campaign Live!",
    instruction:
      "Congratulations! Your campaign is now active. Students will earn bonus points based on your campaign type. You can create more campaigns or edit this one.",
    position: "center",
  },
];

export const smartGuides: Record<string, GuideStep[]> = {
  "give-points": givePointsSmartGuide,
  "create-reward": createRewardSmartGuide,
  "create-campaign": createCampaignSmartGuide,
};
