/* Neri: original notebook explorer. No animation runs while the learner focuses. */
(function (root) {
  "use strict";
  const states = {
    idle: [
      "Ready to explore",
      "M111 104 Q123 94 134 102",
      "M165 102 Q176 96 187 105",
      1,
    ],
    listening: [
      "Listening attentively",
      "M111 99 Q124 91 136 99",
      "M164 98 Q177 89 189 98",
      0,
    ],
    thinking: [
      "Thinking about a hint",
      "M110 105 Q123 95 136 103",
      "M164 91 Q177 89 189 97",
      0,
    ],
    encouraging: [
      "Encouraging another try",
      "M110 100 Q123 92 136 100",
      "M164 100 Q177 92 189 100",
      1,
    ],
    celebrating: [
      "Celebrating your practice",
      "M110 98 Q123 88 136 98",
      "M164 98 Q177 88 189 98",
      2,
    ],
    kind: [
      "Offering kind support",
      "M110 104 Q123 98 136 97",
      "M164 97 Q177 98 189 104",
      1,
    ],
    demonstrating: [
      "Showing a lip movement",
      "M111 99 Q123 94 136 100",
      "M164 100 Q177 94 189 99",
      0,
    ],
    resting: [
      "Staying quiet while you focus",
      "M111 105 Q123 100 136 105",
      "M164 105 Q177 100 189 105",
      0,
    ],
  };
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function mouth(pose = {}) {
    const open = Math.max(0, Math.min(1, Number(pose.open) || 0)),
      contact = Math.max(0, Math.min(1, Number(pose.contact) || 0)),
      nasal = Math.max(0, Math.min(1, Number(pose.nasal) || 0)),
      lower = 151 + open * 24 - contact;
    return `<g class="neri-mouth" data-mouth-opening="${open.toFixed(3)}" data-mouth-contact="${contact.toFixed(3)}">
      <path class="neri-cavity" d="M126 151 Q150 ${151 - open * 7} 174 151 Q171 ${151 + open * 28} 150 ${151 + open * 28} Q129 ${151 + open * 28} 126 151Z" fill="#603d36" opacity="${open > 0.02 ? 1 : 0}"/>
      <path d="M127 151 Q150 ${142 - open * 3} 173 151" fill="none" stroke="#b86b55" stroke-width="5" stroke-linecap="round"/>
      <path d="M137 148 Q150 146 163 148 L163 157 Q150 159 137 157Z" fill="#fffdf5" stroke="#bba78f" stroke-width=".8" opacity="${contact}"/>
      <path d="M150 148 L150 156" stroke="#bba78f" stroke-width=".6" opacity="${contact}"/>
      <path d="M128 ${lower} Q150 ${lower + 6} 172 ${lower}" fill="none" stroke="#c57a60" stroke-width="6" stroke-linecap="round"/>
      <path d="M130 151 Q150 152 170 151" fill="none" stroke="#603d36" stroke-width="2" opacity="${open < 0.05 ? 1 : 0}"/>
      <g opacity="${nasal}" class="neri-nasal"><path d="M145 135 Q126 130 123 115 M155 135 Q174 130 177 115" fill="none" stroke="#176f58" stroke-width="3" stroke-dasharray="4 5"/><path d="M119 120 L123 113 L129 119 M171 119 L177 113 L181 120" fill="none" stroke="#176f58" stroke-width="2.5"/></g>
    </g>`;
  }
  function svg(state = "idle", closeup = false, pose) {
    const s = states[state] || states.idle;
    const expressionMouth =
      state === "celebrating"
        ? '<path d="M134 150 Q150 157 167 150 Q164 172 150 170 Q137 168 134 150Z" fill="#603d36"/><path d="M141 165 Q150 160 160 165" fill="#c57a60"/>'
        : `<path d="M137 153 Q150 ${state === "resting" || state === "listening" ? 157 : 164} 164 153" fill="none" stroke="#614837" stroke-width="3.5" stroke-linecap="round"/>`;
    const rightArm = ["resting", "listening", "kind"].includes(state)
      ? "M222 171 Q242 185 239 204 Q242 215 251 210 Q258 207 251 197 Q250 174 225 160"
      : "M222 171 Q250 175 258 157 Q264 148 267 152 Q272 162 263 169 Q281 162 282 169 Q280 185 257 191 Q240 195 221 185";
    return `<svg class="neri-art" viewBox="${closeup ? "99 112 103 75" : "0 0 300 320"}" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    <g class="neri-body">
      <ellipse cx="152" cy="298" rx="100" ry="10" fill="#273849" opacity=".08"/>
      <path d="M113 240 L109 276 M186 239 L191 274" stroke="#d4aa7a" stroke-width="14" stroke-linecap="round"/>
      <path d="M98 270 Q108 264 123 275 L128 289 Q106 299 84 290 Q82 280 98 270Z M180 274 Q191 264 202 273 L224 285 Q227 295 195 296 L180 289Z" fill="#614837" stroke="#273849" stroke-width="3"/>
      <path d="M95 282 L117 281 M189 283 L206 283" stroke="#e5b66d" stroke-width="3" stroke-linecap="round"/>
      <path class="neri-arm neri-left-arm" d="M75 168 Q41 170 40 199 Q41 211 51 210 Q58 207 51 198 Q52 184 78 184" fill="#f2d6a7" stroke="#9e6545" stroke-width="3"/>
      <path class="neri-arm neri-right-arm" d="${rightArm}" fill="#f2d6a7" stroke="#9e6545" stroke-width="3"/>
      <path d="M72 54 Q72 37 92 37 L202 37 L231 65 L231 227 Q231 247 211 250 L91 253 Q71 252 70 233Z" fill="#c86443" stroke="#8a4c36" stroke-width="3"/>
      <path d="M91 236 L217 232 L216 243 L94 247Z" fill="#ddc7a2" stroke="#a58159" stroke-width="2"/>
      <path d="M143 239 L143 281 L157 271 L171 279 L171 237Z" fill="#176f58" stroke="#115642" stroke-width="2"/>
      <path d="M86 48 Q85 39 99 40 L194 40 L222 68 L222 225 Q222 236 210 237 L99 241 Q85 242 85 226Z" fill="#fff0cf" stroke="#9e6545" stroke-width="3"/>
      <path d="M193 41 L193 70 L222 69" fill="#e9c895" stroke="#ae8051" stroke-width="2" stroke-linejoin="round"/>
      <path d="M98 224 Q154 229 210 220" fill="none" stroke="#d9be91" stroke-width="2"/>
      <path d="M79 71 C49 60 49 88 78 83 M79 119 C49 108 49 136 78 131 M79 167 C49 156 49 184 78 179" fill="none" stroke="#a66b38" stroke-width="9" stroke-linecap="round"/>
      <path d="M78 69 C52 61 52 81 64 82 M78 117 C52 109 52 129 64 130 M78 165 C52 157 52 177 64 178" fill="none" stroke="#e5b66d" stroke-width="4" stroke-linecap="round"/>
      <g class="neri-face">${closeup ? "" : `<path d="${s[1]}" fill="none" stroke="#614837" stroke-width="5" stroke-linecap="round"/><path d="${s[2]}" fill="none" stroke="#614837" stroke-width="5" stroke-linecap="round"/>`}
      ${closeup ? "" : state === "celebrating" || state === "resting" ? '<path d="M113 122 Q124 112 135 122 M165 122 Q176 112 187 122" fill="none" stroke="#273849" stroke-width="4" stroke-linecap="round"/>' : '<ellipse cx="124" cy="121" rx="10" ry="13" fill="#273849"/><ellipse cx="176" cy="121" rx="10" ry="13" fill="#273849"/><circle cx="127" cy="117" r="3" fill="#fff8e9"/><circle cx="179" cy="117" r="3" fill="#fff8e9"/>'}
      <path d="M147 133 Q143 138 148 139 M153 133 Q157 138 152 139" fill="none" stroke="#bd9570" stroke-width="2" stroke-linecap="round"/>
      <g data-neri-mouth>${pose || state === "demonstrating" ? mouth(pose || { open: 0.1 }) : expressionMouth}</g>
      <ellipse cx="110" cy="145" rx="8" ry="4" fill="#c86443" opacity=".16"/><ellipse cx="190" cy="145" rx="8" ry="4" fill="#c86443" opacity=".16"/>
      </g><path d="M101 196 H113 M101 204 H109" stroke="#176f58" stroke-width="3" stroke-linecap="round"/>
    </g></svg>`;
  }
  function create(host, options = {}) {
    let state = "idle",
      caption = "",
      destroyed = false;
    host.classList.add("neri");
    const api = {
      update(next = {}) {
        if (destroyed) return;
        state = Object.hasOwn(states, next.state) ? next.state : state;
        caption = next.caption ?? caption;
        host.dataset.neriState = state;
        host.innerHTML = `<div class="neri-picture" role="img" aria-label="${esc("Neri, the notebook explorer. " + states[state][0])}">${svg(state, options.closeup)}</div>${options.closeup ? "" : `<p class="neri-caption">${esc(caption)}</p>`}`;
      },
      pose(value) {
        if (!destroyed)
          host.querySelector("[data-neri-mouth]").innerHTML = mouth(value);
      },
      destroy() {
        destroyed = true;
        host.replaceChildren();
        host.removeAttribute("data-neri-state");
      },
    };
    api.update(options);
    return api;
  }
  root.Neri = { states: Object.keys(states), create, svg, mouth };
})(globalThis);
