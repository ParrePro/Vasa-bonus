import { GuideStep } from "./GuideOverlay";

export const givePointsGuide: GuideStep[] = [
  {
    title: "Welcome to Give Points Guide",
    description:
      "Learn how to award points to your students. This guide will walk you through each step.",
    position: "top",
  },
  {
    title: "Select a Class",
    description:
      "First, choose the class you want to work with. All of your classes are listed here.",
    target: "[data-guide='class-select']",
    position: "right",
  },
  {
    title: "Navigate to Give Points",
    description:
      "Click on the 'Give Points' section in the sidebar to access the points management interface.",
    target: "[data-guide='give-points-nav']",
    position: "right",
  },
  {
    title: "Select a Student",
    description:
      "Choose the student you want to give points to from the list. You can search by name if needed.",
    target: "[data-guide='student-select']",
    position: "right",
  },
  {
    title: "Enter Points Amount",
    description:
      "Type the number of points you want to award to the student. Make sure the amount is positive.",
    target: "[data-guide='points-input']",
    position: "top",
  },
  {
    title: "Add an Optional Note",
    description:
      "You can add a message to explain why you're giving these points. This helps students understand their rewards.",
    target: "[data-guide='points-note']",
    position: "top",
  },
  {
    title: "Submit",
    description:
      "Click the 'Give Points' button to award the points to the student. The transaction will be recorded immediately.",
    target: "[data-guide='submit-points']",
    position: "top",
  },
  {
    title: "Confirmation",
    description:
      "You'll see a confirmation message. The points have been successfully added to the student's account.",
    position: "top",
  },
];

export const createRewardGuide: GuideStep[] = [
  {
    title: "Welcome to Create Reward Guide",
    description:
      "Learn how to create rewards that students can redeem with their points.",
    position: "top",
  },
  {
    title: "Open Create Reward Dialog",
    description:
      "Click the 'Add Reward' or 'New Reward' button to start creating a new reward.",
    target: "[data-guide='add-reward-button']",
    position: "right",
  },
  {
    title: "Enter Reward Title",
    description:
      "Give your reward a clear, descriptive name that students will recognize. For example: 'Extra Recess Time' or 'Homework Pass'.",
    target: "[data-guide='reward-title']",
    position: "top",
  },
  {
    title: "Add Reward Description",
    description:
      "Describe what the reward includes and any relevant details. This helps students understand exactly what they're earning.",
    target: "[data-guide='reward-description']",
    position: "top",
  },
  {
    title: "Set Points Cost",
    description:
      "Decide how many points this reward is worth. Higher point costs should be for more valuable rewards. This should be achievable but not too easy.",
    target: "[data-guide='reward-points']",
    position: "top",
  },
  {
    title: "Choose Reward Category",
    description:
      "Select the category: 'Tangible' (physical items), 'Symbolic' (certificates, badges), or 'Privilege' (special activities or permissions).",
    target: "[data-guide='reward-category']",
    position: "right",
  },
  {
    title: "Upload Reward Image (Optional)",
    description:
      "Add an image to make your reward more appealing to students. This shows up in their reward list.",
    target: "[data-guide='reward-image']",
    position: "top",
  },
  {
    title: "Set Purchase Limits",
    description:
      "Decide how many times students can purchase this reward: 'Once' (limited quantity), 'Unlimited' (available forever), or 'Custom' (specific number of times).",
    target: "[data-guide='reward-purchase-limit']",
    position: "right",
  },
  {
    title: "Availability Settings",
    description:
      "Choose if the reward is available all year or during a specific time period. You can set start and end dates if needed.",
    target: "[data-guide='reward-availability']",
    position: "right",
  },
  {
    title: "Create Reward",
    description:
      "Click 'Create Reward' to save your reward. Students will be able to see it immediately in the rewards catalog.",
    target: "[data-guide='create-reward-submit']",
    position: "top",
  },
];

export const createCampaignGuide: GuideStep[] = [
  {
    title: "Welcome to Create Campaign Guide",
    description:
      "Campaigns are special events that boost point rewards for a limited time. Let's create one together!",
    position: "top",
  },
  {
    title: "Open Create Campaign Dialog",
    description:
      "Click the 'Add Campaign' or 'New Campaign' button to start creating a new campaign.",
    target: "[data-guide='add-campaign-button']",
    position: "right",
  },
  {
    title: "Campaign Title",
    description:
      "Give your campaign a catchy name. Examples: 'Reading Boost Week', 'Math Excellence Month', 'Homework Hero Challenge'.",
    target: "[data-guide='campaign-title']",
    position: "top",
  },
  {
    title: "Campaign Description",
    description:
      "Explain what the campaign is about and why students should participate. This motivates engagement.",
    target: "[data-guide='campaign-description']",
    position: "top",
  },
  {
    title: "Campaign Type: Multiplier",
    description:
      "A multiplier increases ALL points earned during the campaign. For example, a 2x multiplier means students earn double points for all activities.",
    target: "[data-guide='campaign-type-multiplier']",
    position: "right",
  },
  {
    title: "Campaign Type: Set Points",
    description:
      "Alternatively, set a fixed number of bonus points. Every action during the campaign earns this many bonus points, regardless of the regular point value.",
    target: "[data-guide='campaign-type-set']",
    position: "right",
  },
  {
    title: "Multiplier Value Explained",
    description:
      "If you set a 1.5x multiplier, students earn 150% of normal points. A 2x multiplier means 200%. Higher values make the campaign more rewarding but use more resources.",
    target: "[data-guide='campaign-multiplier-input']",
    position: "top",
  },
  {
    title: "Bonus Points Explained",
    description:
      "If using 'Set Points' mode, enter a flat bonus. For example, 50 extra points per action during the campaign period.",
    target: "[data-guide='campaign-points-input']",
    position: "top",
  },
  {
    title: "Campaign Duration",
    description:
      "Choose how long the campaign lasts: Quick (2 minutes for testing), Weekly (7 days), Monthly (30 days), Yearly, or Custom duration.",
    target: "[data-guide='campaign-duration']",
    position: "right",
  },
  {
    title: "Max Participations",
    description:
      "Set a limit on how many times each student can earn points during this campaign. Leave blank for unlimited.",
    target: "[data-guide='campaign-max-participations']",
    position: "top",
  },
  {
    title: "Campaign Availability",
    description:
      "You can schedule the campaign to start and end on specific dates. This lets you plan campaigns in advance.",
    target: "[data-guide='campaign-availability']",
    position: "right",
  },
  {
    title: "Upload Campaign Image (Optional)",
    description:
      "Add an attractive image to make the campaign more visually appealing and exciting for students.",
    target: "[data-guide='campaign-image']",
    position: "top",
  },
  {
    title: "Create Campaign",
    description:
      "Click 'Create Campaign' to launch your campaign. It will be active immediately and students will see the bonus points when they earn rewards.",
    target: "[data-guide='create-campaign-submit']",
    position: "top",
  },
  {
    title: "Campaign Tips",
    description:
      "💡 Tip: Use campaigns during important periods (before exams, during reading month, etc.). Multipliers work great for motivating overall effort, while set points are better for specific actions.",
    position: "top",
  },
];

export const guides: Record<string, GuideStep[]> = {
  "give-points": givePointsGuide,
  "create-reward": createRewardGuide,
  "create-campaign": createCampaignGuide,
};
