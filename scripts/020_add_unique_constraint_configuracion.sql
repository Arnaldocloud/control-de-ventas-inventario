-- Add a unique constraint on organizacion_id in the configuracion table
ALTER TABLE configuracion 
ADD CONSTRAINT configuracion_organizacion_id_key UNIQUE (organizacion_id);

-- If there are any duplicate organizacion_id values, we need to handle them first
-- This keeps only the most recent configuration for each organization
WITH RankedConfigs AS (
    SELECT 
        id,
        organizacion_id,
        ROW_NUMBER() OVER (PARTITION BY organizacion_id ORDER BY actualizado_en DESC) as rn
    FROM configuracion
)
DELETE FROM configuracion 
WHERE id IN (
    SELECT id FROM RankedConfigs WHERE rn > 1
);
