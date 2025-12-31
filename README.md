# Goal Tracking Dashboard

A simple, single-page web application for tracking and managing goals across different categories. Built with vanilla JavaScript, HTML, and CSS - no frameworks required.

## Features

### Three Main Views

1. **Active Work View** (Default)
   - Shows only active goals
   - Grouped by category with collapsible sections
   - Sorted by priority (High → Medium → Low)
   - Inline editing for tracking values and checkboxes
   - Quick actions: change priority, change status, edit, and delete

2. **Weekly Review View**
   - Shows all goals except completed/deprioritized
   - Highlights goals with no updates in 2+ weeks
   - Summary statistics at the top
   - Easy batch reprioritization
   - Deprioritize goals with required reason field

3. **Archive View**
   - Shows completed and deprioritized goals
   - Displays completion/deprioritization dates and reasons
   - Restore goals back to active status
   - Permanently delete archived goals

### Goal Data Structure

Each goal includes:
- Name
- Category
- Tracking type (number with target OR yes/no checkbox)
- Current value
- Priority (High/Medium/Low)
- Status (Not Started/Active/Blocked/Completed/Deprioritized)
- Date added
- Target completion date (optional)
- Notes
- Last updated timestamp

### Additional Features

- **Data Persistence**: All data stored in browser's localStorage
- **Import/Export**: Backup and restore your goals as JSON files
- **Responsive Design**: Works on mobile but optimized for desktop
- **AI Summary Placeholder**: Reserved section for future AI-powered insights

## Setup Instructions for GitHub Pages

### Option 1: Deploy from GitHub Repository

1. **Create a GitHub repository** (if you haven't already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Goal Tracking Dashboard"
   git remote add origin https://github.com/YOUR-USERNAME/goals-tracker.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click on **Settings**
   - Scroll down to **Pages** in the left sidebar
   - Under "Source", select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder
   - Click **Save**

3. **Access your dashboard**:
   - Your site will be live at: `https://YOUR-USERNAME.github.io/goals-tracker/`
   - It may take a few minutes for the first deployment

### Option 2: Local Development

1. **Clone or download this repository**

2. **Open in browser**:
   - Simply open `index.html` in your web browser
   - No server required - it runs entirely in the browser

3. **Make changes**:
   - Edit the files as needed
   - Refresh your browser to see changes

## Usage Guide

### Adding a Goal

1. Click the **"+ Add Goal"** button
2. Fill in the required fields:
   - Goal Name
   - Category (can be new or select from existing)
   - Tracking Type (number with target or yes/no checkbox)
   - Priority
   - Status
3. Optionally add:
   - Target completion date
   - Notes
4. Click **"Save Goal"**

### Tracking Progress

**In Active Work View:**
- For number-based goals: Click on the value field and update
- For checkbox goals: Click the checkbox to mark complete
- Changes save automatically

### Managing Goals

**Change Priority:**
- Use the dropdown in the goal card to reprioritize

**Change Status:**
- Use the status dropdown to move goals between statuses
- Selecting "Deprioritized" will prompt for a reason

**Edit Goal:**
- Click the "Edit" button to modify any goal details

**Delete Goal:**
- Click the "Delete" button and confirm

### Weekly Reviews

1. Switch to the **Weekly Review** tab
2. Review the summary statistics at the top
3. Check for goals marked "Needs Attention" (no updates in 2+ weeks)
4. Use the "Reprioritize" dropdown for quick priority adjustments
5. Click "Deprioritize" for goals you want to pause (requires reason)

### Archiving

1. Switch to the **Archive** tab
2. View all completed and deprioritized goals
3. See completion dates and reasons
4. Restore goals back to Active if needed
5. Permanently delete goals you no longer need

### Backup & Restore

**Export Data:**
1. Click **"Export Data"** button
2. A JSON file will download with timestamp
3. Store this file safely as your backup

**Import Data:**
1. Click **"Import Data"** button
2. Select a previously exported JSON file
3. Confirm the replacement (this will overwrite current data)
4. Your goals will be restored

## Data Storage

- All data is stored in your browser's localStorage
- Data persists across browser sessions
- Data is specific to the domain/browser combination
- Clearing browser data will delete your goals
- **Important**: Regular exports are recommended for backup

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Changing Colors

Edit `styles.css` and modify the CSS variables in the `:root` section:

```css
:root {
    --primary-color: #3b82f6;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    /* etc. */
}
```

### Adding Categories

Categories are created automatically when you add a new goal. Just type a new category name in the category field.

### Modifying Priority Levels

To change priority options, edit both:
1. The `<select id="priority">` in `index.html`
2. The priority sorting logic in `app.js`

## Troubleshooting

**Goals not saving:**
- Check if localStorage is enabled in your browser
- Some browsers block localStorage in private/incognito mode

**Import not working:**
- Ensure the JSON file is from a previous export
- Check that the file hasn't been corrupted

**Display issues:**
- Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache
- Ensure you're using a modern browser

## Future Enhancements

The dashboard includes a placeholder for AI-powered summary features, which could include:
- Automated progress insights
- Goal completion predictions
- Suggested goal prioritization
- Pattern recognition in goal achievement

## License

Free to use and modify for personal or commercial projects.

## Contributing

Feel free to fork, modify, and submit pull requests for improvements!
