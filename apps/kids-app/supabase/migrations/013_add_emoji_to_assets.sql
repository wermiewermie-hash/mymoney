-- Add emoji field to assets table
alter table public.assets
add column emoji text;

-- Set default emojis for existing assets based on their type
update public.assets
set emoji = case
  when type = 'bank_account' then '💰'
  when type = 'stocks' then '📈'
  when type = 'retirement_account' then '🏦'
  when type = 'index_funds' then '📊'
  when type = 'debt' then '💳'
  when type = 'cash' then '💵'
  else '💰'
end
where emoji is null;
