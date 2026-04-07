# DECO3801_project14_RainbowSix
Ranbowsix code base for project14, HTML exract, mapping and score.

## First update<br>
- **index.js**: input and output setting<br>
- **src/analyzer.js**: analysis the url, exract each features use for futer work<br>
- **output/**: jason vision output

## Second update<br>
- **src/scorer.js**: calculate cognitive accessibility scores (0-100) based on analyzer data, and map issues to WCAG and ISO 9241-11 standards.<br>
- **index.js**: updated to connect the scorer. Now it outputs a frontend-friendly JSON with status (good/warning/poor) and actionable insights.<br>

## Third Update (Latest)
- **index.js**: Added File System (`fs`) integration. Reports are now automatically timestamped and saved as `analysis-YYYY-MM-DD...json`.
- **src/analyzer.js**: 
    - **Media Intelligence**: Added specific logic to detect `<track>` captions in videos and identify autoplay behaviors.
    - **DOM Sanitization**: Implemented cloning and noise removal (scripts/styles) for accurate text metrics.
- **src/mapping.js**: Formalized the dictionary for all 5 dimensions, including weights, WCAG 2.1 success criteria, and ISO 9241 standards.
- **src/scorer.js**: Refined the `scoreMetric` function to handle three logic types: `lowerBetter`, `higherBetter`, and `range`. Added `generateInsights` to filter critical issues.

---
## 🛠 Installation & Usage
### 1.Install dependencies:
 `npm install puppeteer`
### 2.Run the analyzer:
 `node index.js [https://example.com](https://example.com)`

---
## 📖 Appendix: Technical Documentation

This appendix provides a deep dive into the architecture, scoring logic, and data extraction methodology used in the **RainbowSix** analyzer.


### 1. System Architecture & Pipeline
The application follows a strictly decoupled architecture, separating data collection from evaluation logic.

[Image of web scraping and data analysis pipeline architecture]

1.  **Orchestrator (`index.js`)**: Handles CLI arguments, manages the asynchronous flow, and persists results to the file system.
2.  **Data Collector (`src/analyzer.js`)**: A Puppeteer-based engine that interfaces with the Chromium V8 engine to extract DOM properties.
3.  **Knowledge Base (`src/mapping.js`)**: A dictionary defining thresholds, weights, and regulatory mappings (WCAG/ISO).
4.  **Scoring Engine (`src/scorer.js`)**: A stateless module that transforms raw data into normalized scores.

### 2. Advanced Extraction Methodology

#### 2.1 DOM Sanitization
To prevent "noise" (e.g., JavaScript code, CSS rules) from inflating word counts or complexity ratios, the analyzer performs a **Clone-and-Strip** operation:
* The `document.body` is cloned into a virtual fragment.
* `<script>`, `<style>`, and `<noscript>` tags are purged.
* Only the remaining `innerText` is passed to the NLP (Natural Language Processing) logic.

#### 2.2 Visibility Awareness
Unlike basic scrapers, this tool uses `window.getComputedStyle` to ensure that only elements actually rendered on the screen (where `display !== 'none'`) contribute to the **Visual Density Score**.


### 3. Scoring Mathematics & Heuristics

The system employs a **Weighted Normalization** algorithm to ensure that critical issues (like missing form labels) impact the overall score more heavily than minor issues.

#### 3.1 The Weighted Average Formula
For each section (Language, Visual, etc.), the score is calculated as:

$$Score_{section} = \frac{\sum_{i=1}^{n} (S_i \times W_i)}{\sum_{i=1}^{n} W_i}$$

* **$S_i$**: The normalized score (0-100) of a specific metric.
* **$W_i$**: The assigned weight from `mapping.js`.

#### 3.2 Normalized Metric Types
| Logic Type | Mathematical Description | Example |
| :--- | :--- | :--- |
| **Lower Better** | $100 \times (1 - \frac{value - good}{bad - good})$ | `complexWordRatio` |
| **Higher Better** | $100 \times (\frac{value - bad}{good - bad})$ | `labelCoverage` |
| **Range Optimal** | $100 \times (1 - \frac{value - ideal}{max - ideal})$ | `visualDensityScore` |

### 4. Regulatory & Standards Mapping

The RainbowSix analyzer cross-references each technical metric with international accessibility (WCAG 2.1) and usability (ISO 9241-11) standards to provide actionable context for the generated insights.

#### 4.1 WCAG 2.1 Success Criteria Mapping
Metrics are categorized under the core principles of WCAG to help developers ensure their web content is accessible to all users, including those with cognitive disabilities.

| WCAG Principle | Metric & Success Criteria | Impact on User Experience |
| :--- | :--- | :--- |
| **Perceivable** | `contrastIssueCount` (1.4.3/1.4.6)<br>`visualDensityScore` (1.4.8)<br>`videosWithCaptionsRatio` (1.2.2) | Ensures text is readable, layouts are not overwhelming, and multimedia is accessible to users with hearing or visual impairments. |
| **Operable** | `maxDepth` (2.4.1/2.4.5)<br>`autoplayMediaCount` (2.2.2) | Ensures users can navigate the site easily without being trapped by deep structures or distracted by moving content they cannot control. |
| **Understandable** | `sentenceAverageLength` (3.1.5)<br>`complexWordRatio` (3.1.3)<br>`labelCoverage` (3.3.2) | Ensures the text is clear and that forms provide sufficient instructions and labels to prevent user error. |

#### 4.2 ISO 9241-11 Usability Model
We evaluate the "Quality of Use" by mapping insights to the three pillars of the ISO 9241-11 standard:

* **Effectiveness (Can users complete their tasks?)**
    * **Form Labels (`labelCoverage`)**: Without labels, users often fail to complete data entry.
    * **Vocabulary (`complexWordRatio`)**: Jargon-heavy text leads to a failure in information retrieval.
    * **Contrast (`contrastIssueCount`)**: Poor visibility prevents users from correctly identifying interface elements.
* **Efficiency (How much effort is required?)**
    * **Reading Level (`sentenceAverageLength`)**: Long sentences increase the cognitive load and time required to process information.
    * **Navigational Depth (`maxDepth`)**: Deeply nested menus increase the physical and mental effort (number of clicks) to reach content.
    * **Visual Complexity (`visualDensityScore`)**: Cluttered pages increase "search time" for specific actions or info.
* **Satisfaction (Is the experience comfortable?)**
    * **Control over Media (`autoplayMediaCount`)**: Unexpected audio or video significantly lowers user satisfaction and can cause anxiety or physical discomfort (e.g., for users with vestibular disorders).

---

### 5. Scoring Weights & Priority
Each metric is assigned a `weight` in `mapping.js` (ranging from 1.0 to 1.5). Higher weights indicate metrics that have a more critical impact on accessibility compliance:
- **High Priority (1.5)**: `sentenceAverageLength`, `visualDensityScore`, `labelCoverage`, `videosWithCaptionsRatio`.
- **Medium Priority (1.2)**: `contrastIssueCount`, `autoplayMediaCount`.
- **Standard Priority (1.0)**: `complexWordRatio`, `maxDepth`.
