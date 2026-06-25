import { ExportIcon, RerollIcon } from "@/features/reveal/components/PersonalizeIcons";
import { PolaroidButton } from "@/features/reveal/components/PolaroidButton";

type Props = {
  changesRemaining: number;
  isLastTirage: boolean;
  onChangePhoto: () => void;
  onShare: () => void;
  onShowMyPhotos: () => void;
  onTakeNewPhoto: () => void;
};

export function DevelopControls({
  changesRemaining,
  isLastTirage,
  onChangePhoto,
  onShare,
  onShowMyPhotos,
  onTakeNewPhoto,
}: Props) {
  const canReroll = changesRemaining > 0;

  return (
    <>
      <button
        className="c-develop__share"
        type="button"
        onClick={onShare}
        aria-label="Partager cette photo"
      >
        <ExportIcon />
      </button>

      <div className="c-develop__actions">
        <button
          className="c-develop__change"
          type="button"
          onClick={onChangePhoto}
          disabled={!canReroll}
        >
          <RerollIcon />
          {canReroll ? `${changesRemaining} reroll left` : "no reroll left"}
        </button>

        <PolaroidButton onClick={isLastTirage ? onShowMyPhotos : onTakeNewPhoto}>
          {isLastTirage ? "SHOW ALL SNAPS" : "TAKE A NEW SNAP"}
        </PolaroidButton>
      </div>
    </>
  );
}
