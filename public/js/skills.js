// ============================================
// SKILLS - Rendering and selection logic
// ============================================

import { readySkills, skillFocusAreas } from "./data.js";
import { renderSkillDemo, setupDemoTabs } from "./demo-renderer.js";
import { setupDemoToggles } from "./demo-toggles.js";

let currentSkill = null;

// Format skill ID to display name (e.g., "ux-writing" -> "UX Writing")
function formatSkillName(id) {
	return id
		.split("-")
		.map((word) => {
			// Handle special cases like "ux" -> "UX"
			if (word.toLowerCase() === "ux") return "UX";
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(" ");
}

// Check if a skill is ready for public use
function isSkillReady(id) {
	return readySkills.includes(id);
}

// Filter out frontend-design (Anthropic's skill, not ours)
function filterSkills(skills) {
	return skills.filter((s) => s.id !== "frontend-design");
}

export function renderSkillsNav(skills, onSelect) {
	const nav = document.getElementById("skills-nav");
	if (!nav) return;

	const filteredSkills = filterSkills(skills);

	nav.innerHTML = filteredSkills
		.map(
			(skill) => `
    <button class="skill-nav-item ${!isSkillReady(skill.id) ? "coming-soon" : ""}" data-id="${skill.id}">
      ${formatSkillName(skill.id)}
      ${!isSkillReady(skill.id) ? '<span class="coming-soon-badge">Soon</span>' : ""}
    </button>
  `,
		)
		.join("");

	nav.querySelectorAll(".skill-nav-item").forEach((btn) => {
		btn.addEventListener("click", () => {
			const skill = filteredSkills.find((s) => s.id === btn.dataset.id);
			if (skill) onSelect(skill);
		});
	});

	return filteredSkills;
}

export function selectSkill(skill, allSkills) {
	currentSkill = skill;

	// Update nav active state
	document.querySelectorAll(".skill-nav-item").forEach((btn) => {
		btn.classList.toggle("active", btn.dataset.id === skill.id);
	});

	// Render showcase
	const showcase = document.getElementById("skills-detail");
	if (showcase) {
		showcase.innerHTML = renderSkillShowcase(skill, allSkills);
		setupDemoTabs();
		setupDemoToggles();

		// Add click handlers for relationship tags
		showcase
			.querySelectorAll(".relationship-tag[data-skill]")
			.forEach((tag) => {
				tag.addEventListener("click", () => {
					const skillId = tag.dataset.skill;
					const targetSkill = allSkills.find((s) => s.id === skillId);
					if (targetSkill) selectSkill(targetSkill, allSkills);
				});
			});
	}
}

function renderSkillShowcase(skill, allSkills) {
	const focusAreas = skillFocusAreas[skill.id] || [];
	const displayName = formatSkillName(skill.id);
	const ready = isSkillReady(skill.id);

	// Coming soon placeholder for incomplete skills
	if (!ready) {
		return `
      <div class="coming-soon-showcase">
        <div class="coming-soon-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 6v6l4 2M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          </svg>
        </div>
        <h3>${displayName}</h3>
        <p class="coming-soon-text">This skill is being refined and will be available soon.</p>
        <p class="skill-description">${skill.description}</p>
      </div>
    `;
	}

	return `
    <div class="skill-demo-area">
      ${renderSkillDemo(skill.id)}
    </div>
    <div class="skill-info-panel">
      <div class="skill-header">
        <h3>${displayName}</h3>
        <div class="meta">
          <span>Skill</span>
          <span>·</span>
          <a href="https://github.com/pbakaus/vibe-design-plugins/blob/main/source/skills/${skill.id}.md" target="_blank" rel="noopener">
            View Source →
          </a>
        </div>
      </div>
      
      <p class="skill-description">${skill.description}</p>
      
      ${
				focusAreas.length > 0
					? `
        <div class="skill-section">
          <h4>Focus Areas</h4>
          <div class="focus-areas-compact">
            ${focusAreas
							.map(
								(area) => `
              <span class="focus-area-tag">
                <strong>${area.area}</strong>
                <span>${area.detail}</span>
              </span>
            `,
							)
							.join("")}
          </div>
        </div>
      `
					: ""
			}
      
      <div class="skill-downloads">
        <span class="downloads-label">Download for:</span>
        <a href="/api/download/skill/cursor/${skill.id}" class="download-icon" title="Cursor">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 3h13a2.5 2.5 0 012.5 2.5v13a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 18.5v-13A2.5 2.5 0 015.5 3zm6.5 4L7 12l5 5v-3.5h4v-3h-4V7z"/></svg>
        </a>
        <a href="/api/download/skill/claude-code/${skill.id}" class="download-icon" title="Claude Code">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
        </a>
        <a href="/api/download/skill/gemini/${skill.id}" class="download-icon" title="Gemini CLI">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </a>
        <a href="/api/download/skill/codex/${skill.id}" class="download-icon" title="Codex CLI">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
        </a>
      </div>
    </div>
  `;
}

export function getCurrentSkill() {
	return currentSkill;
}
