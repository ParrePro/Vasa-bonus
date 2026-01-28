# Help System Documentation

## Overview
A comprehensive help/guide system has been added to the Teacher and Developer dashboards. This system provides step-by-step guidance for common tasks with interactive overlays that highlight relevant UI elements.

## Features

### 1. Help Button
- Located in the **bottom right corner** of both Teacher and Developer dashboards
- Floating button that's always accessible
- Opens a dropdown menu with available help topics

### 2. Help Topics Available

#### For Teachers:
- **How to Give Points**: Step-by-step guide for awarding points to students
- **How to Create a Campaign**: Detailed guide including explanations of:
  - Campaign types (Multiplier vs Set Points)
  - Points multiplier explanation (e.g., 2x = double points)
  - Duration options
  - Max participations
  - Availability scheduling
- **How to Create a Reward**: Guide for creating student rewards with all options explained

#### For Developers:
- Same three help topics as teachers (since developers have similar responsibilities)

### 3. Guide Overlay System
When a guide is selected:
- A semi-transparent overlay appears
- Specific UI elements are highlighted with a glowing border
- A tooltip shows the current step with:
  - Clear title
  - Detailed explanation
  - Visual progress indicator (e.g., "Step 2 of 7")
  - Previous/Next navigation buttons

### 4. Key Features of the Guide System
- **Element Highlighting**: Each step can target specific UI elements to draw attention
- **Flexible Positioning**: Tooltips position themselves intelligently (top, bottom, left, right)
- **Step Navigation**: Users can go back/forward through guides
- **Close Anytime**: Users can close guides at any time
- **Progress Tracking**: Visual indicator shows current step and total steps

## Technical Components

### Files Created:

1. **`src/components/help/HelpButton.tsx`**
   - Floating help button with dropdown menu
   - Lists all available guides
   - Triggers guide selection

2. **`src/components/help/GuideOverlay.tsx`**
   - Main guide overlay component
   - Handles element highlighting
   - Shows step-by-step tooltips
   - Manages navigation between steps

3. **`src/components/help/guides.ts`**
   - Configuration file with all guide content
   - Defines steps for each guide
   - Contains explanations and UI element selectors

### Modified Files:
- `src/pages/TeacherDashboard.tsx` - Integrated help system
- `src/pages/DeveloperDashboard.tsx` - Integrated help system

## How to Use in Components

To make elements targetable by the help system, add `data-guide` attributes:

```jsx
<button data-guide="give-points-nav">Give Points</button>
<input data-guide="points-input" />
<button data-guide="submit-points">Submit</button>
```

The guide system uses CSS selectors to find these elements:
```typescript
target: "[data-guide='element-name']"
```

## Adding New Guides

To add a new guide:

1. Create an array of `GuideStep` objects in `src/components/help/guides.ts`:
```typescript
export const newGuide: GuideStep[] = [
  {
    title: "Step Title",
    description: "Step description explaining what to do",
    target: "[data-guide='element-id']", // CSS selector
    position: "bottom", // top, bottom, left, right
    highlightPadding: 8, // Optional
  },
  // ... more steps
];
```

2. Add to the `guides` object:
```typescript
export const guides: Record<string, GuideStep[]> = {
  "give-points": givePointsGuide,
  "create-campaign": createCampaignGuide,
  "create-reward": createRewardGuide,
  "new-guide": newGuide, // Add here
};
```

3. Update the `HelpButton.tsx` to include the new guide in the `guides` array.

## Guide Step Interface

```typescript
interface GuideStep {
  title: string;              // Step title shown to user
  description: string;        // Detailed explanation
  target?: string;           // CSS selector for element to highlight
  position?: "top" | "bottom" | "left" | "right"; // Tooltip position
  highlightPadding?: number;  // Padding around highlighted element (default: 8)
}
```

## Campaign Guide - Detailed Explanations

The campaign creation guide includes special explanations for:

### Multiplier vs Set Points
- **Multiplier Mode**: Increases points by a factor (e.g., 2x doubles all points earned)
- **Set Points Mode**: Adds a flat bonus amount to each action

### Key Campaign Settings Explained
- **Duration Types**: Quick (testing), Weekly, Monthly, Yearly, Custom
- **Max Participations**: Limits how many times a student earns bonus points
- **Availability**: Schedule campaigns for specific dates
- **Points Multiplier**: Example given - "1.5x multiplier means 150% of normal points"

## Styling
The help system uses:
- Tailwind CSS for styling
- Shadcn/ui components for buttons and cards
- Lucide icons for visual elements
- Primary color for highlights and accents

## Browser Compatibility
Works on all modern browsers that support:
- CSS positioning and transforms
- ES6+ JavaScript
- React hooks

## Accessibility
- Can be closed with the X button or by clicking the overlay
- Keyboard navigation through Previous/Next buttons
- Clear visual hierarchy and contrast
- Descriptive step titles and explanations
