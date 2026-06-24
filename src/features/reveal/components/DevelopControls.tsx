import { Share } from "lucide-react";
import { PolaroidButton } from "@/features/reveal/components/PolaroidButton";

type Props = {
  isLastTirage: boolean;
  onChangePhoto: () => void;
  onShare: () => void;
  onShowMyPhotos: () => void;
  onTakeNewPhoto: () => void;
};

export function DevelopControls({
  isLastTirage,
  onChangePhoto,
  onShare,
  onShowMyPhotos,
  onTakeNewPhoto,
}: Props) {
  return (
    <>
      <button
        className="c-develop__share"
        type="button"
        onClick={onShare}
        aria-label="Partager cette photo"
      >
        <Share aria-hidden="true" />
      </button>

      <div className="c-develop__actions">
        <button
          className="c-develop__change"
          type="button"
          onClick={onChangePhoto}
          disabled={isLastTirage}
        >
          Change this photo
        </button>

        <PolaroidButton
          onClick={isLastTirage ? onShowMyPhotos : onTakeNewPhoto}
        >
          {isLastTirage ? "SHOW MY PHOTOS" : "TAKE A NEW PHOTO"}
        </PolaroidButton>
      </div>
    </>
  );
}
