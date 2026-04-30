export const NUTRITION_TEMPLATE_MEDIA = {
  "high-protein-breakfast": {
    image: "/nutrition/high-protein-breakfast.png",
    alt: "High-protein breakfast example with eggs, yogurt, oats, and fruit."
  },
  "quick-lunch": {
    image: "/nutrition/quick-lunch.png",
    alt: "Quick lunch example with a balanced high-protein bowl."
  },
  "protein-gap-snack": {
    image: "/nutrition/protein-gap-snack.png",
    alt: "Protein-focused snack example with dairy, fruit, and quick grab options."
  }
};

export function getNutritionTemplateMedia(templateId) {
  return NUTRITION_TEMPLATE_MEDIA[templateId] || null;
}
