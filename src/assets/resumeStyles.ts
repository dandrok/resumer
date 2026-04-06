export const resumeStyles = String.raw`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --primary-color: #111827; /* Dark gray for almost everything */
  --secondary-color: #4b5563; /* Lighter gray for dates/locations */
  --accent-color: #2563eb; /* Subtle blue for links if any */
  --bg-color: #ffffff;
  --spacing-base: 8px;
}

@page {
  margin: 8mm 16mm 0mm 16mm; /* Bottom: 0mm */
  size: A4;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: var(--primary-color);
  background-color: var(--bg-color);
  font-size: 10.5pt; /* Perfect readable size for printed/PDF text */
  line-height: 1.5; /* Breathable lines */
  margin: 0;
  padding: 0;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

/* Typography Hierarchy */
h1, h2, h3, h4, p, ul, li {
  margin: 0;
  padding: 0;
}

/* Name */
h1 {
  font-size: 24pt;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: calc(var(--spacing-base) * 0.5);
  text-align: center;
}

/* Contact Info / Tagline under Name */
h1 + p {
  font-size: 9.5pt;
  color: var(--secondary-color);
  text-align: center;
  margin-bottom: calc(var(--spacing-base) * 2.5);
}

h1 + p a {
  color: var(--primary-color);
  text-decoration: none;
  margin: 0 4px;
}

/* Section Headers (Experience, Skills, etc.) */
h2 {
  font-size: 12.5pt;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--primary-color);
  border-bottom: 1px solid #e5e7eb; /* Clean, subtle separator */
  padding-bottom: 4px;
  margin-top: calc(var(--spacing-base) * 2);
  margin-bottom: calc(var(--spacing-base) * 1.5);
}

/* Role / Job Title */
h3 {
  font-size: 11pt;
  font-weight: 600;
  margin-top: calc(var(--spacing-base) * 1.5);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

/* Company / Organization */
h4 {
  font-size: 10.5pt;
  font-weight: 500;
  color: var(--secondary-color);
  margin-bottom: calc(var(--spacing-base) * 1);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

/* Dates and Locations (usually placed on the right via bold or italic in Markdown) */
h3 strong, h4 em {
  font-size: 9.5pt;
  font-weight: 400;
  color: var(--secondary-color);
  font-style: normal;
}

/* Paragraphs (Summary) */
p {
  margin-bottom: calc(var(--spacing-base) * 1.5);
  text-align: justify;
}

/* Highlighting matching keywords */
strong {
  font-weight: 600; /* Semibold for matches */
  color: var(--primary-color);
}

/* Specific styling for Skill Categories (***Category:***) */
strong em {
  font-weight: 700; /* Bold for category labels */
  font-style: normal; /* Remove italic to keep it clean */
  text-transform: capitalize;
}

/* Lists (Experience Bullets) */
ul {
  list-style-type: none;
  margin-bottom: calc(var(--spacing-base) * 1.5);
}

li {
  position: relative;
  padding-left: 14px;
  margin-bottom: 6px; /* Space between bullets */
}

li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--secondary-color);
  font-size: 12pt;
  line-height: 1.4;
}

/* Skills section formatting (if output as bold key: value) */
p strong {
  font-weight: 600;
  color: var(--primary-color);
}

/* Ensure nothing breaks awkwardly across pages */
h2, h3, h4 {
  page-break-after: avoid;
}

ul, p {
  page-break-inside: avoid;
}
`;
