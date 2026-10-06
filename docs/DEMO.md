# Demo walkthrough

[View the 60-second animated walkthrough](media/walkthrough.gif). It assembles real production screenshots of search, details, saving, progress, and GSoC into a stepped demo. It is not a continuous video recording. The instructions below are for recording a narrated version.

A two-minute screen recording is enough to show the project. Record the app itself; skip the editor and setup terminals.

## Before recording

- Start the frontend and API, or use the verified Vercel deployment.
- Use a test account with a neutral display name. Close cloud consoles, personal tabs, password managers, and notifications.
- Use 100% browser zoom and record at 1080p if available.
- Test your search first. Choose a small issue with a readable description; live results can change.
- Keep environment files, OAuth secrets, database credentials, and authorization codes out of the recording.

## Two-minute sequence

| Time | On screen | Suggested narration |
| --- | --- | --- |
| 0:00–0:12 | Search page | “This is Contribution Finder. I built it to make it easier to find an open source issue and keep track of work I want to contribute.” |
| 0:12–0:35 | Select TypeScript, good first issue, and unassigned | “I can narrow the search by language and label. These are open issues from GitHub, and I can filter out work that already has an assignee.” |
| 0:35–0:55 | Open an issue and point out the GitHub link | “The detail page gives me the context. Before starting, I check the original issue and the project's contribution guide.” |
| 0:55–1:15 | Save the issue and open My contributions | “Once I'm signed in, I can save an issue and track it here.” |
| 1:15–1:35 | Change saved to in progress | “These statuses are my own notes. The app doesn't submit a pull request or claim that it was merged automatically.” |
| 1:35–1:52 | Open a GSoC organization | “There is also a curated GSoC directory with repositories and contributor guides for finding a community to work with.” |
| 1:52–2:05 | Return to search and toggle the theme | “It's built with React and TypeScript, an Express API, and MongoDB. The repository has the setup instructions if you want to run it locally.” |

Use your own wording. A steady cursor and short pauses help more than music or animated transitions. Do not claim you completed the issue unless you actually contributed it.

## Record and export

Use a screen recorder you already have, such as Windows Snipping Tool's recording mode or OBS. Select only the browser window or app area. Record a short test to check text readability and microphone volume.

Export MP4 or WebM. Trim empty time at the beginning and end. Watch the whole export once for secrets, personal information, unreadable text, or failed requests.

## Add it to the README

Upload the video to a host you control, or use GitHub's supported video attachment flow in the README editor. Copy the actual published URL and replace the README's Demo paragraph:

```md
## Demo

[Watch the two-minute walkthrough](YOUR_ACTUAL_VIDEO_URL)

The recording covers issue search, saved contributions, and the GSoC directory.
```

Replace the placeholder before committing. Avoid committing large video files to Git. Check the published link while signed out so visitors can watch it.
