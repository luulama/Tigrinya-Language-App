/* Neri: an original cinnamon bear. Character acting is separate from human lip teaching. */
(function (root) {
  "use strict";
  const states = {
    idle: [
      "Welcoming you",
      "M110 100 Q121 92 134 100",
      "M164 100 Q177 92 189 100",
    ],
    listening: [
      "Listening attentively",
      "M110 96 Q122 90 134 98",
      "M164 98 Q177 92 189 99",
    ],
    thinking: [
      "Thinking about a hint",
      "M110 103 Q122 96 134 102",
      "M164 92 Q177 88 189 96",
    ],
    encouraging: [
      "Encouraging another try",
      "M110 99 Q122 92 134 99",
      "M164 99 Q177 92 189 99",
    ],
    celebrating: [
      "Celebrating your practice",
      "M110 96 Q122 85 134 96",
      "M164 96 Q177 85 189 96",
    ],
    kind: [
      "Offering gentle support",
      "M110 104 Q122 97 134 98",
      "M164 98 Q177 97 189 104",
    ],
    demonstrating: [
      "Helping you watch the lip guide",
      "M110 100 Q122 93 134 100",
      "M164 100 Q177 93 189 100",
    ],
    resting: [
      "Staying quiet while you focus",
      "M110 102 Q122 98 134 102",
      "M164 102 Q177 98 189 102",
    ],
    sleepy: [
      "Resting quietly for a bedtime story",
      "M110 105 Q122 100 134 105",
      "M164 105 Q177 100 189 105",
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

  function animalMouth(state, pose) {
    const open = pose
      ? Math.max(0, Math.min(0.8, Number(pose.open) || 0))
      : state === "celebrating"
        ? 0.65
        : 0;
    const curve = state === "resting" || state === "sleepy" ? 166 : 173;
    return `<g class="neri-animal-mouth" data-neri-animal-expression="true"><path d="M150 146 L150 158" stroke="#644232" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${open > 0.04 ? `<path d="M133 160 Q150 168 167 160 Q165 ${166 + open * 31} 150 ${166 + open * 31} Q135 ${166 + open * 31} 133 160Z" fill="#50372e"/><path d="M142 ${165 + open * 25} Q150 ${161 + open * 25} 159 ${165 + open * 25}" stroke="#c58267" stroke-width="5" fill="none" stroke-linecap="round"/>` : `<path d="M133 160 Q150 ${curve} 167 160" fill="none" stroke="#644232" stroke-width="3" stroke-linecap="round"/>`}</g>`;
  }
  function head(state, pose) {
    const s = states[state] || states.idle,
      closed = ["celebrating", "resting", "sleepy"].includes(state),
      tilt = state === "listening" ? -6 : state === "thinking" ? 5 : 0;
    return `<g class="neri-head" transform="rotate(${tilt} 150 145)">
      <circle cx="84" cy="66" r="29" fill="#b77349" stroke="#734b35" stroke-width="3"/><circle cx="84" cy="67" r="17" fill="#895433"/>
      <circle cx="216" cy="64" r="30" fill="#bd7b4c" stroke="#734b35" stroke-width="3"/><circle cx="217" cy="66" r="17" fill="#895433"/>
      <path d="M202 39 Q219 25 233 42 Q221 34 211 48" fill="#efd09a"/>
      <path d="M76 93 C80 69 102 49 128 50 L124 38 L139 44 L148 30 L156 44 L170 39 L169 51 C197 49 222 70 227 94 L235 104 L228 107 L235 119 L228 121 C233 153 215 176 190 185 Q150 204 109 184 C82 175 67 154 72 126 L65 119 L73 113 L65 106Z" fill="#bd7b4c" stroke="#734b35" stroke-width="3" stroke-linejoin="round"/>
      <path d="M173 54 Q211 65 221 103 Q215 77 185 70 Q137 54 100 78 Q122 49 146 52" fill="#d79758" opacity=".7"/>
      <path d="M226 122 Q230 161 197 181 Q169 197 143 193 Q184 182 200 158Z" fill="#a7643e"/>
      <path d="${s[1]}" fill="none" stroke="#644232" stroke-width="5" stroke-linecap="round"/><path d="${s[2]}" fill="none" stroke="#644232" stroke-width="5" stroke-linecap="round"/>
      ${closed ? '<path d="M111 119 Q122 129 133 119 M165 119 Q177 129 189 119" fill="none" stroke="#342e2a" stroke-width="3.5" stroke-linecap="round"/>' : `<path d="M108 121 Q119 103 134 117 Q130 133 119 134 Q111 132 108 121Z M164 117 Q180 103 191 121 Q187 133 178 134 Q168 132 164 117Z" fill="#fff1d6" stroke="#734b35" stroke-width="1.5"/><ellipse cx="${state === "thinking" ? 123 : 121}" cy="120" rx="7.5" ry="11" fill="#3c352b"/><ellipse cx="${state === "thinking" ? 179 : 176}" cy="120" rx="7.5" ry="11" fill="#3c352b"/><circle cx="124" cy="116" r="2.8" fill="#fffaf0"/><circle cx="179" cy="116" r="2.8" fill="#fffaf0"/>`}
      <ellipse cx="150" cy="151" rx="41" ry="29" fill="#f2d4a5"/>
      <path d="M136 133 Q150 126 165 134 Q164 145 151 148 Q139 146 136 133Z" fill="#3f332b"/><path d="M140 134 Q150 131 158 134" fill="none" stroke="#756051" stroke-width="3" stroke-linecap="round"/>
      <g data-neri-mouth="">${animalMouth(state, pose)}</g>
      <path d="M83 137 L89 143 M80 146 L86 151 M216 140 L210 146" stroke="#d99c64" stroke-width="2.5" stroke-linecap="round"/>
    </g>`;
  }
  function paw(x, y, rotation = 0, raised = false) {
    return `<g class="neri-paw" transform="translate(${x} ${y}) rotate(${rotation})"><ellipse rx="${raised ? 24 : 31}" ry="${raised ? 36 : 24}" fill="#b77349" stroke="#734b35" stroke-width="3"/>
      ${raised ? '<ellipse cy="8" rx="13" ry="16" fill="#805035"/><ellipse cx="-12" cy="-17" rx="5" ry="7" fill="#805035"/><ellipse cy="-23" rx="5.5" ry="7" fill="#805035"/><ellipse cx="12" cy="-17" rx="5" ry="7" fill="#805035"/>' : '<path d="M-12 11 Q-10 5 -13 0 M0 14 Q3 8 0 3 M12 11 Q15 5 13 0" fill="none" stroke="#805035" stroke-width="2.5" stroke-linecap="round"/>'}</g>`;
  }
  function svg(state = "idle", closeup = false, pose) {
    if (!Object.hasOwn(states, state)) state = "idle";
    if (closeup)
      return `<svg class="neri-art neri-human-guide" data-neri-kind="human-lip-guide" viewBox="99 112 103 75" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><rect x="99" y="112" width="103" height="75" fill="#fff0cf"/><path d="M147 133 Q143 138 148 139 M153 133 Q157 138 152 139" fill="none" stroke="#bd9570" stroke-width="2" stroke-linecap="round"/><g data-neri-mouth="">${mouth(pose || { open: 0.1 })}</g></svg>`;
    if (state === "sleepy")
      return `<svg class="neri-art" data-neri-kind="bear" viewBox="0 70 300 240" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><g class="neri-body neri-curled"><ellipse cx="151" cy="274" rx="120" ry="10" fill="#273849" opacity=".09"/><circle cx="53" cy="239" r="17" fill="#a7643e"/><path d="M38 244 Q23 173 96 151 Q167 129 221 188 L229 256 Q139 291 70 273Z" fill="#b77349" stroke="#734b35" stroke-width="3"/><path d="M57 186 Q89 149 141 164 Q100 164 78 204" fill="#d79758" opacity=".65"/><g transform="translate(81 86) scale(.74)">${head(state)}</g>${paw(167, 260, -6)}${paw(225, 260, 5)}<path d="M63 249 Q92 271 125 264" stroke="#9b5c38" stroke-width="4" fill="none" stroke-linecap="round"/></g></svg>`;
    const wave = ["idle", "encouraging", "demonstrating"].includes(state),
      celebrate = state === "celebrating",
      think = state === "thinking";
    return `<svg class="neri-art" data-neri-kind="bear" viewBox="0 0 300 320" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><g class="neri-body" data-neri-pose="${state}">
      <ellipse cx="150" cy="294" rx="109" ry="10" fill="#273849" opacity=".09"/><circle cx="75" cy="242" r="20" fill="#a7643e" stroke="#734b35" stroke-width="3"/>
      <path d="M100 168 Q148 148 197 171 Q233 203 223 255 Q210 290 151 290 Q92 290 76 257 Q65 207 100 168Z" fill="#b77349" stroke="#734b35" stroke-width="3"/>
      <path d="M181 176 Q219 197 211 251 Q197 279 163 285 Q199 268 197 222Z" fill="#a7643e"/>
      <path d="M117 173 Q148 184 181 173 L175 192 L161 189 L149 213 L138 191 L123 193Z" fill="#e4ba7f"/>
      <ellipse cx="98" cy="268" rx="35" ry="28" transform="rotate(25 98 268)" fill="#b77349" stroke="#734b35" stroke-width="3"/><ellipse cx="201" cy="268" rx="35" ry="28" transform="rotate(-25 201 268)" fill="#b77349" stroke="#734b35" stroke-width="3"/>
      <path d="M91 278 Q98 268 107 269 M191 270 Q201 268 208 278" fill="none" stroke="#805035" stroke-width="3" stroke-linecap="round"/>
      ${celebrate ? paw(68, 173, -37, true) : `<path d="M105 185 Q86 205 94 263 Q107 277 126 263 L130 205" fill="#bd7b4c" stroke="#734b35" stroke-width="3" stroke-linejoin="round"/>${paw(109, 268, 0)}`}
      ${wave || celebrate ? `<path d="M194 186 Q216 190 230 176 L251 187 Q238 221 211 221" fill="#b77349" stroke="#734b35" stroke-width="3"/>${paw(246, 164, celebrate ? 35 : 23, true)}` : think ? `<path d="M197 198 Q222 185 210 162 L190 165 Q203 196 181 210" fill="#b77349" stroke="#734b35" stroke-width="3"/>${paw(198, 166, 20, true)}` : `<path d="M187 187 Q210 206 204 263 Q194 277 175 264 L171 207" fill="#bd7b4c" stroke="#734b35" stroke-width="3"/>${paw(190, 268, 0)}`}
      ${head(state, pose)}<path d="M87 229 L91 234 M212 231 L208 237" stroke="#d99c64" stroke-width="2.5" stroke-linecap="round"/>
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
        host.innerHTML = `<div class="neri-picture" role="img" aria-label="${esc(options.closeup ? "Neri’s schematic human lip guide. " + states[state][0] : "Neri the bear. " + states[state][0])}">${svg(state, options.closeup)}</div>${options.closeup ? "" : `<p class="neri-caption">${esc(caption)}</p>`}`;
      },
      pose(value) {
        if (!destroyed)
          host.querySelector("[data-neri-mouth]").innerHTML = options.closeup
            ? mouth(value)
            : animalMouth(state, value);
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
