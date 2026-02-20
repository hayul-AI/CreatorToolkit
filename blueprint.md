
# CreatorToolkit Blueprint

## Overview

CreatorToolkit is a free web-based utility site that provides a collection of optimization tools for content creators, primarily focusing on YouTube. The site is designed to be fast, user-friendly, and AdSense-friendly, with a clean and modern design.

## Style, Design, and Features

### **Visual Design**
*   **Aesthetics:** A clean, modern, and intuitive user interface. The layout is visually balanced with ample white space.
*   **Color Palette:**
    *   Background: White (`#FFFFFF`)
    *   Accent: Blue (`#007BFF`)
    *   Text: Dark Gray (`#333333`)
*   **Typography:**
    *   Headings: A modern, sans-serif font (e.g., Arial, Helvetica).
    *   Body: A highly readable sans-serif font.
*   **Layout:** Mobile-responsive design using a flexible grid system for the tool cards.
*   **Iconography:** Simple, intuitive icons will be used for each tool card to provide quick visual cues.

### **Features & Components**

*   **Header:** Contains the site title, tagline, and primary navigation.
*   **Navigation:** A responsive navigation menu that collapses on smaller screens.
*   **Hero Section:** A prominent section at the top of the homepage to grab the user's attention.
*   **Tool Cards:** Reusable web components (`<tool-card>`) will be used to display each tool. Each card includes an icon, title, description, and a call-to-action button.
*   **Footer:** Contains secondary links and contact information.
*   **Web Components:** The application will leverage Web Components to create encapsulated and reusable UI elements, starting with the tool cards.

## Current Plan

**Objective:** Create the tool pages inside the `/public` folder with specific functionalities.

**Tools to Implement:**

1.  **Title Checker (`title-checker.html`):**
    *   Functional requirement: User enters a YouTube title. Show character count and a warning if it exceeds 60 characters.
    *   Implementation: Real-time character count using JavaScript.

2.  **Tag Generator (`tag-generator.html`):**
    *   Functional requirement: User enters a keyword. Generate 20 related tags automatically.
    *   Implementation: JavaScript logic to generate related tags based on the input keyword (using a predefined mapping or simple string manipulation).

3.  **Hashtag Generator (`hashtag-generator.html`):**
    *   Functional requirement: User enters a video title. Generate 15 hashtags automatically.
    *   Implementation: Extract keywords from the title and prepend '#' to create hashtags.

4.  **Upload Time Finder (`upload-time.html`):**
    *   Functional requirement: User selects day and region. Display recommended upload time.
    *   Implementation: A simple lookup table in JavaScript for different regions and days.

5.  **Thumbnail Checker (`thumbnail-checker.html`):**
    *   Functional requirement: User enters text. Display whether it is readable for a thumbnail.
    *   Implementation: Visual preview and heuristic-based feedback on text length and size.

**Steps:**

1.  **Update `style.css`:** Add shared styles for tool pages, including form elements, result containers, and utility classes.
2.  **Implement Tool Pages:** Create each HTML file in the `public/` directory, reusing the header and footer from `index.html`.
3.  **Add Tool Logic:** Implement the required JavaScript functionality for each tool directly in the HTML or in a shared `tools.js` file.
4.  **Verification:** Ensure all tools are mobile-friendly and work correctly without external APIs.
