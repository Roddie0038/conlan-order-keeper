-- Create Storage RLS policies for crossdock-pdfs bucket
-- Allow authenticated users to upload cross-dock PDFs
CREATE POLICY "upload crossdock forms"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'crossdock-pdfs');

-- Allow authenticated users to read cross-dock PDFs
CREATE POLICY "read crossdock forms"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'crossdock-pdfs');

-- Allow authenticated users to update/upsert cross-dock PDFs
CREATE POLICY "upsert crossdock forms"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'crossdock-pdfs')
WITH CHECK (bucket_id = 'crossdock-pdfs');

-- Add RLS policies for cross_dock_forms table
-- Allow authenticated users to insert forms
CREATE POLICY "insert cross dock forms"
ON public.cross_dock_forms FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to read forms
CREATE POLICY "read cross dock forms"
ON public.cross_dock_forms FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update forms
CREATE POLICY "update cross dock forms"
ON public.cross_dock_forms FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);