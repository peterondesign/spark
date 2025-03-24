import Image from "next/image";

type ImageProps = {
  src: string | {
    url: string;
    attribution?: {
      name: string;
      username: string;
      profileUrl: string;
    } | null;
  };
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  showAttribution?: boolean;
};

export default function ImageWithAttribution({
  src,
  alt,
  width = 400,
  height = 300,
  className = "",
  showAttribution = true,
}: ImageProps) {
  // Handle different src formats
  const imgUrl = typeof src === "string" ? src : src.url;
  const attribution = typeof src === "string" ? null : src.attribution;

  return (
    <div className="relative">
      <Image
        src={imgUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
      
      {/* Only show attribution if available and requested */}
      {showAttribution && attribution && (
        <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-2 rounded-tl-md">
          <a 
            href={attribution.profileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Photo by {attribution.name}
          </a>
        </div>
      )}
    </div>
  );
}
