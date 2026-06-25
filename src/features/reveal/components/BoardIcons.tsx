/* Thin wrappers around the board SVG assets under /public/icons. */

type IconProps = { className?: string };

function asset(src: string, alt: string) {
  return function Icon({ className }: IconProps) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={src} alt={alt} aria-hidden="true" draggable={false} />;
  };
}

export const UndoIcon = asset("/icons/undo.svg", "Annuler");
export const ProfileIcon = asset("/icons/profil.svg", "Profil");
export const TrashIcon = asset("/icons/trash.svg", "Supprimer");
export const EditIcon = asset("/icons/edit.svg", "Editer");
export const PlusIcon = asset("/icons/plus.svg", "Ajouter");
export const ShapesIcon = asset("/icons/formes.svg", "Formes");
export const StickerIcon = asset("/icons/autocollant.svg", "Stickers");
export const BackgroundIcon = asset("/icons/bg.svg", "Fond");
