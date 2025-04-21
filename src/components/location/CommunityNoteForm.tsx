import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface CommunityNoteFormProps {
  locationId: string;
  onNoteCreated: () => void;
}

interface SocialLink {
  label: string;
  url: string;
}

const defaultSocialLinks = [{ label: "", url: "" }];

const CommunityNoteForm: React.FC<CommunityNoteFormProps> = ({ locationId, onNoteCreated }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(defaultSocialLinks);
  const [adding, setAdding] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      if (file.size > 1024 * 1024) {
        const compressedImage = await compressImage(file);
        if (compressedImage) {
          setImages(prev => [...prev, compressedImage]);
        }
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    }
    (e.target as HTMLInputElement).value = "";
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxDimension = 800;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve("");
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const isValidVideoUrl = (url: string) => {
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+$/;
    return ytRegex.test(url) || vimeoRegex.test(url);
  };

  const handleVideoUrlChange = (value: string) => {
    if (value === "" || isValidVideoUrl(value)) {
      setVideoUrl(value || null);
    } else {
      setVideoUrl(null);
      toast({ title: "Invalid video URL", description: "Only YouTube or Vimeo links are allowed", variant: "destructive" });
    }
  };

  const handleAddSocialLink = () => {
    setSocialLinks(prev => [...prev, { label: "", url: "" }]);
  };

  const handleSocialLinkChange = (i: number, field: 'label' | 'url', value: string) => {
    setSocialLinks(prev => prev.map((link, idx) =>
      idx === i ? { ...link, [field]: value } : link
    ));
  };

  const removeSocialLink = (i: number) => {
    setSocialLinks(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error("You must be logged in to submit a note");
      }
      
      const userId = userData.user?.id;
      
      const contentObj = {
        text: content,
        ...(videoUrl ? { videoUrl } : {})
      };

      const validSocialLinks = socialLinks
        .filter(l => l.label && l.url)
        .map(l => ({ label: l.label, url: l.url }));

      const { error } = await supabase
        .from("community_notes")
        .insert({
          location_id: locationId,
          user_id: userId,
          title: title.trim(),
          content: contentObj as Json,
          images,
          social_links: validSocialLinks as Json,
          thumbs_up: 0,
          thumbs_up_users: []
        });

      if (error) throw error;
      toast({ title: "Community Note submitted!", description: "Thank you for sharing your article." });
      setTitle("");
      setContent("");
      setVideoUrl(null);
      setImages([]);
      setSocialLinks(defaultSocialLinks);
      onNoteCreated();
    } catch (error: any) {
      toast({ title: "Error submitting note", description: error.message || "Unknown error", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  return (
    <form className="mb-6 bg-white border rounded-lg p-5" onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold mb-3">Write a Community Note</h3>

      <div className="mb-3">
        <input
          className="w-full border rounded px-2 py-2 mb-1 text-lg font-medium"
          placeholder="Article title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={80}
          required
        />
      </div>

      <div className="mb-3">
        <textarea
          className="w-full min-h-[480px] border rounded px-2 py-2"
          placeholder="Write your article here (you can share your tips, experiences, stories, etc)"
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={3000}
          required
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-medium">Video URL (YouTube or Vimeo):</label>
        <input
          className="w-full border rounded px-2 py-2"
          placeholder="https://youtube.com/..."
          value={videoUrl || ""}
          onChange={e => handleVideoUrlChange(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-medium">Upload Images or Screenshots:</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {images.map((img, idx) => (
            <img key={idx} src={img} alt={`upload-preview-${idx}`} className="h-16 w-24 rounded border object-cover" />
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label className="block font-medium">Social Media Links:</label>
        {socialLinks.map((link, i) => (
          <div key={i} className="flex items-center mb-2">
            <input
              className="border rounded px-2 py-1 mr-2"
              placeholder="Label (e.g. Instagram)"
              value={link.label}
              onChange={e => handleSocialLinkChange(i, "label", e.target.value)}
            />
            <input
              className="border rounded px-2 py-1 mr-2 flex-1"
              placeholder="https://link.com"
              value={link.url}
              onChange={e => handleSocialLinkChange(i, "url", e.target.value)}
            />
            {socialLinks.length > 1 && (
              <button type="button" onClick={() => removeSocialLink(i)} className="ml-2 text-red-500">Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddSocialLink} className="mt-2 text-blue-500 hover:underline">
          + Add another link
        </button>
      </div>

      <div className="flex mt-4">
        <Button type="submit" disabled={adding}>
          {adding ? "Submitting..." : "Submit Note"}
        </Button>
      </div>
    </form>
  );
};

export default CommunityNoteForm;
