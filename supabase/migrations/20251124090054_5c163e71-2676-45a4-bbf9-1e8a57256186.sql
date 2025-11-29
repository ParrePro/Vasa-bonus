BEGIN;

-- Enable realtime for messages and reward_purchases tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE reward_purchases;

COMMIT;