import { ProblemTag } from "@/types/Codeforces";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const TagSelector = ({
  allTags,
  selectedTags,
  onTagClick,
  onClearTags,
}: {
  allTags: ProblemTag[];
  selectedTags: ProblemTag[];
  onTagClick: (tag: ProblemTag) => void;
  onClearTags: () => void;
}) => {
  return (
    <div className="space-y-2">
      <span className="font-medium text-muted-foreground">
        Problems will be generated randomly if no tags are selected.
      </span>
      <ScrollArea className="w-full rounded-md border">
        <div className="flex flex-wrap justify-center gap-x-1 gap-y-1 p-2">
          {allTags.map((tag) => (
            <Button
              key={tag.value}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              onClick={() => onTagClick(tag)}
            >
              {tag.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <Button variant="destructive" onClick={onClearTags}>
        Clear All
      </Button>
    </div>
  );
};

export default TagSelector;
