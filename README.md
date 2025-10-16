#live site : https://stories-app-two.vercel.app

# Stories App

A simple Next.js app for viewing and uploading stories, similar to Instagram or Snapchat stories.

## Features

- View stories in a horizontally scrollable bar
- Click a story to view it in full screen with progress bar
- Upload new stories (images)
- Responsive design for desktop and mobile
- Drag and touch scroll for story bar
- **Stories are stored in MongoDB**

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- **MongoDB database** (local or cloud, e.g. MongoDB Atlas)

### Installation

```bash
npm install
# or
yarn install
```

### Environment Variables

Create a `.env.local` file and add your MongoDB connection string:

```
MONGODB_URI=your_mongodb_connection_string
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `components/StoriesViewer.tsx` – Main stories viewer component
- `components/Button.tsx` – Reusable button component
- `pages/api/stories.ts` – API route for fetching and uploading stories (uses MongoDB)
- `app/page.tsx` – Main page rendering the stories viewer

## Usage

- Click the "Add Story" button to upload a new image story.
- Click any story in the bar to view it.
- Use left/right arrows or click/tap sides to navigate between stories.
- Stories auto-progress unless paused.

## Customization

- Update styles in `globals.css` or Tailwind config.
- Extend story data model as needed.

## License

MIT
