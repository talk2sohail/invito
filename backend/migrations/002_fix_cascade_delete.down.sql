-- Drop the cascade constraint
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_circleId_fkey";

-- Revert to original behavior (ON DELETE SET NULL)
ALTER TABLE "Invite" 
ADD CONSTRAINT "Invite_circleId_fkey" 
FOREIGN KEY ("circleId") 
REFERENCES "Circle"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;
