import React, { useEffect, useRef } from 'react';

interface EmbeddedPreviewProps {
  script: string;
}

const samplePageHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sample Page</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f5f7;
      color: #172b4d;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    header {
      background-color: #ffffff;
      padding: 1rem 2rem;
      border-bottom: 1px solid #dfe1e6;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    header h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    main {
      flex-grow: 1;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
    h2 {
      font-size: 1.8rem;
      border-bottom: 1px solid #dfe1e6;
      padding-bottom: 0.5rem;
      margin-top: 0;
    }
    p {
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .card {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-top: 1rem;
    }
    footer {
      text-align: center;
      padding: 1rem;
      font-size: 0.8rem;
      color: #6b778c;
      background-color: #ffffff;
      border-top: 1px solid #dfe1e6;
    }
  </style>
</head>
<body>
  <header>
    <h1>Your Awesome Website</h1>
  </header>
  <main>
    <div class="card">
      <h2>Welcome to Our Page!</h2>
      <p>This is a sample page to demonstrate how your chatbot will look and feel when embedded on your website. Interact with the chatbot in the corner to see it in action.</p>
      <p>The chatbot script is loaded dynamically into this preview environment. It will have access to all the configuration you provided, including your business information, personality, and FAQs.</p>
    </div>
  </main>
  <footer>
    <p>&copy; 2024 Your Company. All rights reserved.</p>
  </footer>
</body>
</html>
`;

export const EmbeddedPreview: React.FC<EmbeddedPreviewProps> = ({ script }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && script) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(samplePageHTML);
        doc.close();
        
        const scriptElement = doc.createElement('script');
        // Use a try-catch block to prevent breaking the preview if the script has issues
        try {
          scriptElement.innerHTML = script;
          doc.body.appendChild(scriptElement);
        } catch (e) {
          console.error("Error executing preview script:", e);
        }
      }
    }
  }, [script]);

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-300 shadow-inner overflow-hidden">
      <iframe
        ref={iframeRef}
        title="Chatbot Preview"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};
