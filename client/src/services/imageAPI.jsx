import { useQuery } from "@tanstack/react-query";

const fetchImage = async (id) => {
  const res = await fetch(`/api/file/${id}`);
  if (!res.ok) throw new Error("Failed to fetch image");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

const getMenuImageUrl = async (id) => {
  const res = await fetch(`/api/file/menu-image/${id}`);
  if (!res.ok) throw new Error("Failed to fetch image");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

const useImageUrl = (id) => {
  return useQuery({
    queryKey: ["fetchImage", id],
    queryFn: () => fetchImage(id),
    enabled: !!id, // only run if id exists
    staleTime: 1000 * 60 * 10, // cache for 10 min
  });
};

const useMenuImageUrl = (id) => {
  return useQuery({
    queryKey: ["getMenuImageUrl", id],
    queryFn: () => getMenuImageUrl(id),
    enabled: !!id, // only run if id exists
    staleTime: 1000 * 60 * 10, // cache for 10 min
  });
};

// Export multiple
export { useImageUrl, useMenuImageUrl };
