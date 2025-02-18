import { useState } from "react";
import { Filter, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KeyTrait {
  trait: string;
  required: boolean;
  description: string;
}

interface Job {
  key_traits: KeyTrait[];
}

interface UnifiedFilterMenuProps {
  job: Job;
  onTraitFilterChange: (traits: string[]) => void;
  onCareerTagChange: (tags: string[]) => void;
  onFavoriteChange: (showFavorites: boolean) => void;
  onFitScoreChange: (scores: number[]) => void;
  selectedTraits: string[];
  selectedCareerTags: string[];
  showFavorites: boolean;
  selectedFitScores: number[];
}

const CAREER_TAG_GROUPS = {
  "Career Progression": [
    "High Average Tenure",
    "Low Average Tenure",
    "Single Promotion",
    "Multiple Promotions",
    "Diverse Company Experience",
    "Single Company Focus",
  ],
  "Company Type": [
    "Worked at Big Tech",
    "Worked at Unicorn",
    "Worked at Quant Fund",
  ],
  "Company Stage": [
    "Startup Experience",
    "Growth Company Experience",
    "Public Company Experience",
  ],
};

export function UnifiedFilterMenu({
  job,
  onTraitFilterChange,
  onCareerTagChange,
  onFavoriteChange,
  onFitScoreChange,
  selectedTraits,
  selectedCareerTags,
  showFavorites,
  selectedFitScores,
}: UnifiedFilterMenuProps) {
  const [activeTab, setActiveTab] = useState("traits");

  const hasFilters =
    selectedTraits.length > 0 ||
    selectedCareerTags.length > 0 ||
    showFavorites ||
    selectedFitScores.length > 0;

  const handleTraitToggle = (trait: string) => {
    onTraitFilterChange(
      selectedTraits.includes(trait)
        ? selectedTraits.filter((t) => t !== trait)
        : [...selectedTraits, trait]
    );
  };

  const handleCareerTagToggle = (tag: string) => {
    onCareerTagChange(
      selectedCareerTags.includes(tag)
        ? selectedCareerTags.filter((t) => t !== tag)
        : [...selectedCareerTags, tag]
    );
  };

  const handleFitScoreToggle = (score: number) => {
    onFitScoreChange(
      selectedFitScores.includes(score)
        ? selectedFitScores.filter((s) => s !== score)
        : [...selectedFitScores, score].sort((a, b) => b - a)
    );
  };

  const handleClearFilters = () => {
    onTraitFilterChange([]);
    onCareerTagChange([]);
    onFavoriteChange(false);
    onFitScoreChange([]);
  };

  // Group traits by required/optional
  const traitGroups = {
    "Required Traits": job.key_traits.filter((trait) => trait.required),
    "Optional Traits": job.key_traits.filter((trait) => !trait.required),
  };

  // Get trait style based on whether it's required
  const getTraitStyle = (trait: string): string => {
    const traitInfo = job.key_traits.find((t: KeyTrait) => t.trait === trait);
    return traitInfo?.required
      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200";
  };

  const getTagStyle = (tag: string): string => {
    return "bg-blue-100 text-blue-700 hover:bg-blue-200";
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 border-dashed transition-colors duration-200 text-xs",
              hasFilters
                ? "border-purple-600 bg-purple-50 text-purple-600 hover:bg-purple-100"
                : "hover:border-gray-400 hover:bg-gray-50"
            )}
          >
            <Filter className="mr-2 h-4 w-4" />
            {!hasFilters && "Filters"}
            {hasFilters && (
              <>
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {selectedTraits.length +
                    selectedCareerTags.length +
                    (showFavorites ? 1 : 0) +
                    selectedFitScores.length}
                </Badge>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0 shadow-lg" align="start">
          <div className="p-2 flex items-center justify-between">
            <p className="text-sm font-medium">Filters</p>
            {hasFilters && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="h-auto p-1 text-xs"
              >
                Clear all filters
              </Button>
            )}
          </div>
          <Separator />
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-gray-100 p-1 rounded-none">
              <TabsTrigger
                value="traits"
                className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow"
              >
                Traits{" "}
                {selectedTraits.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedTraits.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="tags"
                className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow"
              >
                Tags{" "}
                {selectedCareerTags.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedCareerTags.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow"
              >
                Favorites{" "}
                {showFavorites && (
                  <Badge variant="secondary" className="ml-1">
                    1
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="fit"
                className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow"
              >
                Fit Score{" "}
                {selectedFitScores.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedFitScores.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="traits" className="m-0">
              <ScrollArea className="h-[400px] px-1 py-2">
                <div className="p-4 space-y-4">
                  {Object.entries(traitGroups).map(([group, traits]) => (
                    <div key={group} className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        {group}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {traits.map((trait) => {
                          const isSelected = selectedTraits.includes(
                            trait.trait
                          );
                          return (
                            <Badge
                              key={trait.trait}
                              variant="secondary"
                              className={cn(
                                "cursor-pointer transition-colors duration-200 hover:opacity-80",
                                isSelected
                                  ? getTraitStyle(trait.trait)
                                  : "bg-gray-100 hover:bg-gray-200"
                              )}
                              onClick={() => handleTraitToggle(trait.trait)}
                            >
                              {trait.trait}
                              {trait.required && (
                                <Star className="h-3 w-3 ml-1 fill-current opacity-75 inline-block" />
                              )}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tags" className="m-0">
              <ScrollArea className="h-[400px] px-1 py-2">
                <div className="p-4 space-y-4">
                  {Object.entries(CAREER_TAG_GROUPS).map(([group, tags]) => (
                    <div key={group} className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        {group}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => {
                          const isSelected = selectedCareerTags.includes(tag);
                          return (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className={cn(
                                "cursor-pointer transition-colors duration-200 hover:opacity-80",
                                isSelected
                                  ? getTagStyle(tag)
                                  : "bg-gray-100 hover:bg-gray-200"
                              )}
                              onClick={() => handleCareerTagToggle(tag)}
                            >
                              {tag}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="favorites" className="m-0">
              <ScrollArea className="h-[400px] px-1 py-2">
                <div className="p-4">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "cursor-pointer transition-colors duration-200 hover:opacity-80 w-full justify-start h-9 px-3",
                      showFavorites
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : "bg-gray-100 hover:bg-gray-200"
                    )}
                    onClick={() => onFavoriteChange(!showFavorites)}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4 mr-2",
                        showFavorites && "fill-yellow-400"
                      )}
                    />
                    {showFavorites ? "Hide Favorites" : "Show Favorites"}
                  </Badge>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="fit" className="m-0">
              <ScrollArea className="h-[400px] px-1 py-2">
                <div className="p-4 space-y-2">
                  {[4, 3, 2, 1, 0].map((score) => (
                    <Badge
                      key={score}
                      variant="secondary"
                      className={cn(
                        "cursor-pointer transition-colors duration-200 hover:opacity-80 w-full justify-start h-9 px-3",
                        selectedFitScores.includes(score)
                          ? "bg-gray-200 text-gray-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      )}
                      onClick={() => handleFitScoreToggle(score)}
                    >
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full mr-2",
                          score === 4 && "bg-green-500",
                          score === 3 && "bg-blue-500",
                          score === 2 && "bg-yellow-500",
                          score === 1 && "bg-orange-500",
                          score === 0 && "bg-red-500"
                        )}
                      />
                      <span className="flex-1 text-left">
                        {score === 4 && "Ideal Fit"}
                        {score === 3 && "Good Fit"}
                        {score === 2 && "Potential Fit"}
                        {score === 1 && "Likely Not Fit"}
                        {score === 0 && "Not Fit"}
                      </span>
                      {selectedFitScores.includes(score) && (
                        <X className="h-4 w-4 ml-2" />
                      )}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
      {hasFilters && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-gray-100 transition-colors duration-200"
          onClick={handleClearFilters}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear filters</span>
        </Button>
      )}
    </div>
  );
}
