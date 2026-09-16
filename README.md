# Sort Grid

An F1-themed sorting algorithm visualiser. Cars represent array values and move across a starting grid as the real algorithm executes. The source panel stays synchronised through semantic recorder keys rather than fragile hard-coded line numbers.

<img width="1202" height="706" alt="image" src="https://github.com/user-attachments/assets/f35b48c8-07ee-4b97-b920-94bf21cbfe51" />


## Features

- Bubble, insertion, selection and Lomuto quick sort
- JavaScript, Python and C# source with Shiki highlighting
- Recorder-driven comparison, swap, current and sorted states
- Playback, scrubbing, speed controls and keyboard shortcuts
- Responsive light and dark layouts
- Installable PWA with offline support
- Automated malware-signature scanning before GitHub Pages deployment

## Development

```bash
pnpm install
pnpm dev
```

Production build:

```bash
pnpm build
```

The GitHub Pages build is configured for `/sort-grid/`.
