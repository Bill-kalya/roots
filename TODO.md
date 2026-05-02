It appears that you cannot scroll to other sections because the <body> element has overflow: hidden and its height is locked to the viewport height (616px). This prevents any scrolling beyond the initial view, even if the content inside (the .roots-landing container) is much taller.

The Problem
body: Has overflow: hidden and height: 616px. This "clips" all content that doesn't fit in the first 616 pixels.
html: Also has a height restricted to 616px.
.roots-landing: This container is actually 2933px tall, but because its parents (body and html) are restricted and have overflow hidden, you can't reach the rest of the content.
The Fix
To allow scrolling and see all sections, you need to remove the overflow restriction and height limit on the body and html elements.