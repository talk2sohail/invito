-- Drop the existing constraint
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_circleId_fkey";

-- Add the new constraint with ON DELETE CASCADE
ALTER TABLE "Invite" 
ADD CONSTRAINT "Invite_circleId_fkey" 
FOREIGN KEY ("circleId") 
REFERENCES "Circle"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;
