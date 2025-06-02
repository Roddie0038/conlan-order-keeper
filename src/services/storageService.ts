
import { supabase } from "@/integrations/supabase/client";

export const uploadFileToSupabase = async (
  file: File,
  bucket: string,
  userId?: string
): Promise<string> => {
  try {
    // Create a unique filename with user ID folder structure
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId || 'anonymous'}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    console.log(`📁 Uploading file to bucket: ${bucket}, path: ${fileName}`);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error('❌ Storage upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log('✅ File uploaded successfully:', data.path);
    
    // Return the full storage URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
      
    return publicUrl;
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
};

export const uploadMultipleFiles = async (
  files: File[],
  bucket: string,
  userId?: string
): Promise<string[]> => {
  const uploadPromises = files.map(file => 
    uploadFileToSupabase(file, bucket, userId)
  );
  
  return Promise.all(uploadPromises);
};
