const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(/\/\* ---- CARD ---- \*\/[\s\S]*?\/\* ---- LOCATION ---- \*\//, `/* ---- CARD ---- */
.card {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 100vh;
  width: 100%;
  padding: clamp(2rem, 6vw, 5rem);
  gap: clamp(1rem, 4vw, 3rem);
  max-width: 100%; /* Take full width of signage */
}

.left-panel, .right-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(0.5rem, 2vh, 1.5rem);
}

.left-panel {
  align-items: flex-start;
  text-align: left;
}

.right-panel {
  align-items: flex-end;
  text-align: right;
}

/* ---- LOCATION ---- */`);

css = css.replace(/\.datetime-block {[\s\S]*?}/, `.datetime-block {
  text-align: left;
  line-height: 1;
}`);

css = css.replace(/\.condition {[\s\S]*?}/, `.condition {
  font-size: clamp(1rem, 2.8vw, 2rem);
  font-weight: 300;
  color: var(--text-main);
  letter-spacing: 0.06em;
  text-align: right;
  opacity: 0.9;
}`);

// remove the glass card media query as it messes up the max-width: 700px;
css = css.replace(/\/\* ---- GLASS CARD \(optional on some themes\) ---- \*\/[\s\S]*?\/\* ---- ERROR STATE ---- \*\//, `/* ---- ERROR STATE ---- */`);

fs.writeFileSync('styles.css', css);
console.log("updated styles.css");
