-- Create player profiles table
CREATE TABLE public.player_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  coins BIGINT NOT NULL DEFAULT 0,
  gems INTEGER NOT NULL DEFAULT 0,
  total_coins_earned BIGINT NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create upgrades table
CREATE TABLE public.player_upgrades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  upgrade_type TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, upgrade_type)
);

-- Create inventory table
CREATE TABLE public.player_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL, -- 'case', 'skin', 'ability', 'coin'
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  rarity TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- Enable Row Level Security
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_inventory ENABLE ROW LEVEL SECURITY;

-- Create policies for player_profiles
CREATE POLICY "Users can view their own profile" 
ON public.player_profiles 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own profile" 
ON public.player_profiles 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own profile" 
ON public.player_profiles 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Create policies for player_upgrades
CREATE POLICY "Users can view their own upgrades" 
ON public.player_upgrades 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own upgrades" 
ON public.player_upgrades 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own upgrades" 
ON public.player_upgrades 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own upgrades" 
ON public.player_upgrades 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create policies for player_inventory
CREATE POLICY "Users can view their own inventory" 
ON public.player_inventory 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own inventory" 
ON public.player_inventory 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own inventory" 
ON public.player_inventory 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own inventory" 
ON public.player_inventory 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_player_profiles_updated_at
  BEFORE UPDATE ON public.player_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_upgrades_updated_at
  BEFORE UPDATE ON public.player_upgrades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_inventory_updated_at
  BEFORE UPDATE ON public.player_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();