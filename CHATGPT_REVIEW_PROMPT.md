# PulsePeak Review Prompt

Use this prompt with the uploaded files:
- `CHATGPT_FULL_REVIEW_BUNDLE.md`
- `CHATGPT_MEDIA_MANIFEST.md`

Review the PulsePeak Fitness App as a real paid fitness product, not as a toy demo.

Context:
- PulsePeak is a React + Vite frontend with an Express backend.
- It has already been through multiple product passes covering workouts, plans, mobility, onboarding, monetization, media, settings, progression, and staging setup.
- The code bundle contains the current app state.
- The media manifest lists the current public media assets and artifact files.

Your job:
- audit the current implementation deeply
- identify what is actually working vs what is still weak, fake, brittle, or incomplete
- be direct and specific
- prioritize real product issues over abstract style opinions

Review this app across these areas:

1. Architecture consistency
- Are the frontend, shared logic, and backend data layers coherent?
- Are there duplicated patterns, conflicting abstractions, or brittle logic paths?
- Are there places where the product looks deeper than the implementation really is?

2. UX consistency
- Are interactions consistent across Workouts, Plan, Mobility, Nutrition, Settings, and Account?
- Are there likely dead surfaces, misleading UI states, or fake-action patterns still present?
- Does the app feel like one system or several stitched-together systems?

3. Product realism
- Does the app now behave like a credible premium fitness product?
- Where does it still feel prototype-level?
- Which surfaces are still too shallow or too text-heavy?

4. Workouts engine quality
- Does the Workouts page behave like a real reactive training engine?
- Do category, equipment, focus, sort, and session loading appear structurally sound?
- Are there risks in session flow, swapping, saving, or workout generation?

5. Plan and mobility integration
- Does Plan actually drive workouts and mobility?
- Does Mobility feel correctly separated into yoga, stretching, rehab, recovery, and injury-specific modes?
- Are there places where the content model or UI still blurs these domains?

6. Media and credibility
- Does the media system look production-ready?
- Are the current image/model rules consistent and enforceable?
- Are there gaps between the media architecture and the actual surfaced media?
- Are there places where fallback behavior may still feel fake?

7. Settings / account / navigation
- Is the nav hierarchy coherent?
- Does Settings lead to real controls only?
- Does account, billing, and purchase history handling feel clean and honest?

8. Monetization clarity
- Is free/trial/premium behavior understandable and technically consistent?
- Are there any suspicious or brittle branches in entitlements, upgrade prompts, billing flow, or trial logic?

9. Content depth and scalability
- Does the catalog/library structure seem scalable?
- Does the content architecture actually support long-term growth, or are there hidden bottlenecks?
- Does the current “large library” feel depend too much on simulated depth?

10. Testing and reliability
- Based on the bundle, where are the most likely runtime failures or regression risks?
- Is the current smoke coverage enough?
- What user journeys still need true end-to-end testing?

Output format:

1. EXECUTIVE SUMMARY
- 5-10 sentence plain-English assessment of the current state

2. TOP FINDINGS
- ordered by severity
- include file references wherever possible
- focus on bugs, broken logic, regressions, misleading UI, weak implementation, and product-risk issues

3. WHAT IS ACTUALLY STRONG
- list the parts that are genuinely well-structured or product-credible now

4. WHAT STILL FEELS FAKE / THIN / BRITTLE
- identify remaining prototype signals

5. HIGHEST-PRIORITY NEXT STEPS
- only the next 5-10 best actions
- prioritize stabilization and quality over feature sprawl

6. OPTIONAL REFACTOR NOTES
- only if there are meaningful cleanup opportunities

Important review rules:
- Do not just praise the architecture.
- Do not assume a feature is good because there is code for it.
- Judge the app as if it is trying to become a top-tier paid fitness product.
- Favor truth over positivity.
- Focus on real product quality, real usability, and real implementation integrity.
