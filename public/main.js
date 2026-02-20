class ToolCard extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        .tool-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          background-color: #f9f9f9;
        }
        .tool-card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .tool-icon {
          width: 50px;
          height: 50px;
          margin-bottom: 15px;
        }
        .tool-title {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .tool-description {
          font-size: 1rem;
          margin-bottom: 20px;
        }
        .tool-button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          transition: background-color 0.3s;
        }
        .tool-button:hover {
          background-color: #0056b3;
        }
      </style>
      <div class="tool-card">
        <img src="${this.getAttribute('icon')}" alt="${this.getAttribute('title')}" class="tool-icon">
        <h3 class="tool-title">${this.getAttribute('title')}</h3>
        <p class="tool-description">${this.getAttribute('description')}</p>
        <a href="${this.getAttribute('link')}" class="tool-button">Open Tool</a>
      </div>
    `;

    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('tool-card', ToolCard);
