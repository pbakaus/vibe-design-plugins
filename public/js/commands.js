// ============================================
// COMMANDS - Rendering, workflow, and category logic
// ============================================

import {
	commandCategories,
	commandProcessSteps,
	commandRelationships,
	readyCommands,
} from "./data.js";
import { renderCommandDemo } from "./demo-renderer.js";
import { setupCommandDemoToggles } from "./demo-toggles.js";

let currentCommand = null;
let currentCategory = "all";

// Check if a command is ready for public use
function isCommandReady(id) {
	return readyCommands.includes(id);
}

export function renderWorkflowDiagram(allCommands, onSelectCommand) {
	const container = document.getElementById("workflow-diagram");
	if (!container) return;

	// Group commands by category for the sidebar
	const groups = {
		production: [
			"audit",
			"normalize",
			"adapt",
			"clarify",
			"harden",
			"optimize",
			"polish",
		],
		aesthetic: [
			"bolder",
			"quieter",
			"animate",
			"delight",
			"colorize",
			"simplify",
		],
		system: ["extract", "onboard"],
	};

	const renderNavItem = (id) => {
		const ready = isCommandReady(id);
		return `<button class="command-nav-item ${!ready ? "coming-soon" : ""}" data-command="${id}">/${id}${!ready ? '<span class="coming-soon-badge">Soon</span>' : ""}</button>`;
	};

	container.innerHTML = `
    <div class="command-nav-group">
      <span class="command-nav-label">Production</span>
      ${groups.production.map(renderNavItem).join("")}
    </div>
    <div class="command-nav-group">
      <span class="command-nav-label">Aesthetic</span>
      ${groups.aesthetic.map(renderNavItem).join("")}
    </div>
    <div class="command-nav-group">
      <span class="command-nav-label">System</span>
      ${groups.system.map(renderNavItem).join("")}
    </div>
  `;

	// Add click handlers
	container.querySelectorAll(".command-nav-item").forEach((node) => {
		node.addEventListener("click", () => {
			const commandId = node.dataset.command;
			const command = allCommands.find((c) => c.id === commandId);
			if (command) onSelectCommand(command);
		});
	});
}

export function setupCategoryTabs(onFilter) {
	const tabs = document.querySelectorAll(".category-tab");
	tabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			currentCategory = tab.dataset.category;
			tabs.forEach((t) => t.classList.toggle("active", t === tab));
			onFilter(currentCategory);
		});
	});
}

export function filterCommands(category) {
	const cards = document.querySelectorAll(".command-card");
	cards.forEach((card) => {
		const commandId = card.dataset.id;
		const cmdCategory = commandCategories[commandId];
		const visible = category === "all" || cmdCategory === category;
		card.style.display = visible ? "" : "none";
	});
}

export function renderCommandsGrid(commands, onSelectCommand) {
	const grid = document.getElementById("commands-nav");
	if (!grid) return;

	grid.innerHTML = commands
		.map(
			(cmd) => `
    <button class="command-card" data-id="${cmd.id}">
      <div class="command-card-name">/${cmd.id}</div>
      <div class="command-card-desc">${cmd.description.slice(0, 60)}${cmd.description.length > 60 ? "..." : ""}</div>
      <span class="command-card-category">${commandCategories[cmd.id] || "other"}</span>
    </button>
  `,
		)
		.join("");

	grid.querySelectorAll(".command-card").forEach((card) => {
		card.addEventListener("click", () => {
			const cmd = commands.find((c) => c.id === card.dataset.id);
			if (cmd) onSelectCommand(cmd);
		});
	});
}

export function selectCommand(command, allCommands) {
	currentCommand = command;

	// Update nav active state
	document.querySelectorAll(".command-nav-item").forEach((item) => {
		item.classList.toggle("active", item.dataset.command === command.id);
	});

	// Render detail
	const detail = document.getElementById("commands-detail");
	if (detail) {
		detail.innerHTML = renderCommandDetail(command);
		setupCommandDemoToggles(allCommands, (cmd) =>
			selectCommand(cmd, allCommands),
		);
	}
}

function renderCommandDetail(command) {
	const relationships = commandRelationships[command.id] || {};
	const steps = commandProcessSteps[command.id] || [];
	const category = commandCategories[command.id] || "other";
	const ready = isCommandReady(command.id);

	// Coming soon placeholder for incomplete commands
	if (!ready) {
		return `
      <div class="coming-soon-showcase">
        <div class="coming-soon-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 6v6l4 2M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          </svg>
        </div>
        <h3>/${command.id}</h3>
        <p class="coming-soon-text">This command is being refined and will be available soon.</p>
        <p class="skill-description">${command.description}</p>
      </div>
    `;
	}

	return `
    <div class="command-detail-panel">
      <div class="command-demo-area">
        ${renderCommandDemo(command.id)}
      </div>
      
      <div class="command-info-area">
        <div class="command-header">
          <h3>/${command.id}</h3>
          <div class="meta">
            <a href="https://github.com/pbakaus/vibe-design-plugins/blob/main/source/commands/${command.id}.md" target="_blank" rel="noopener">
              View Source →
            </a>
          </div>
        </div>
        
        <p class="command-description">${command.description}</p>
        
        ${
					steps.length > 0
						? `
          <div class="skill-section">
            <h4>Process</h4>
            <div class="process-steps-compact">
              ${steps.map((step) => `<span class="process-step-compact">${step}</span>`).join("")}
            </div>
          </div>
        `
						: ""
				}
        
        ${
					relationships.combinesWith
						? `
          <div class="skill-section">
            <h4>Combines With</h4>
            <div class="relationship-tags">
              ${relationships.combinesWith
								.map(
									(name) => `
                <button class="relationship-tag" data-command="${name}">/${name}</button>
              `,
								)
								.join("")}
            </div>
          </div>
        `
						: ""
				}
        
        ${
					relationships.leadsTo
						? `
          <div class="skill-section">
            <h4>Often Leads To</h4>
            <div class="relationship-tags">
              ${relationships.leadsTo
								.map(
									(name) => `
                <button class="relationship-tag" data-command="${name}">/${name}</button>
              `,
								)
								.join("")}
            </div>
          </div>
        `
						: ""
				}
        
        ${
					relationships.pairs
						? `
          <div class="skill-section">
            <h4>Opposite</h4>
            <div class="relationship-tags">
              <button class="relationship-tag" data-command="${relationships.pairs}">/${relationships.pairs}</button>
            </div>
          </div>
        `
						: ""
				}
        
        <div class="skill-downloads">
          <span class="downloads-label">Download for:</span>
          <a href="/api/download/command/cursor/${command.id}" class="download-icon" title="Cursor">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 3h13a2.5 2.5 0 012.5 2.5v13a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 18.5v-13A2.5 2.5 0 015.5 3zm6.5 4L7 12l5 5v-3.5h4v-3h-4V7z"/></svg>
          </a>
          <a href="/api/download/command/claude-code/${command.id}" class="download-icon" title="Claude Code">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          </a>
          <a href="/api/download/command/gemini/${command.id}" class="download-icon" title="Gemini CLI">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </a>
          <a href="/api/download/command/codex/${command.id}" class="download-icon" title="Codex CLI">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
          </a>
        </div>
      </div>
    </div>
  `;
}

export function getCurrentCommand() {
	return currentCommand;
}
