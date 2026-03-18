export type PostBlock = {
  id: string;
  type: string;
  content: any;
  order: number;
};

export function splitBlocksIntoSlides(blocks: PostBlock[] | undefined | null) {
  const slides: PostBlock[][] = [];
  if (!blocks || blocks.length === 0) return slides;

  let current: PostBlock[] = [];

  for (const block of blocks) {
    if (block.type === "divider") {
      if (current.length > 0) {
        slides.push(current);
        current = [];
      }
      continue;
    }
    current.push(block);
  }

  if (current.length > 0) slides.push(current);
  return slides;
}

