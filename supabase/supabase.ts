export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			games: {
				Row: {
					created_at: string;
					id: string;
					name: string;
				};
				Insert: {
					created_at?: string;
					id: string;
					name: string;
				};
				Update: {
					created_at?: string;
					id?: string;
					name?: string;
				};
				Relationships: [];
			};
			sessions: {
				Row: {
					created_at: string;
					id: string;
					session: string | null;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string;
					id: string;
					session?: string | null;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string;
					id?: string;
					session?: string | null;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			users: {
				Row: {
					bgg_username: string;
					created_at: string;
					id: number;
					telegram_username: string | null;
					tesera_username: string | null;
				};
				Insert: {
					bgg_username: string;
					created_at?: string;
					id?: number;
					telegram_username?: string | null;
					tesera_username?: string | null;
				};
				Update: {
					bgg_username?: string;
					created_at?: string;
					id?: number;
					telegram_username?: string | null;
					tesera_username?: string | null;
				};
				Relationships: [];
			};
			users_to_games: {
				Row: {
					created_at: string;
					game_id: string | null;
					id: number;
					user_id: number | null;
				};
				Insert: {
					created_at?: string;
					game_id?: string | null;
					id?: number;
					user_id?: number | null;
				};
				Update: {
					created_at?: string;
					game_id?: string | null;
					id?: number;
					user_id?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: "public_users_to_games_game_id_fkey";
						columns: ["game_id"];
						isOneToOne: false;
						referencedRelation: "games";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "public_users_to_games_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (Database["public"]["Tables"] & Database["public"]["Views"])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
				Database[PublicTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
			Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
	  }
		? R
		: never
	: PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
				Database["public"]["Views"])
	  ? (Database["public"]["Tables"] &
				Database["public"]["Views"])[PublicTableNameOrOptions] extends {
				Row: infer R;
		  }
			? R
			: never
	  : never;

export type TablesInsert<
	PublicTableNameOrOptions extends
		| keyof Database["public"]["Tables"]
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
	  }
		? I
		: never
	: PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
	  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
				Insert: infer I;
		  }
			? I
			: never
	  : never;

export type TablesUpdate<
	PublicTableNameOrOptions extends
		| keyof Database["public"]["Tables"]
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
	  }
		? U
		: never
	: PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
	  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
				Update: infer U;
		  }
			? U
			: never
	  : never;

export type Enums<
	PublicEnumNameOrOptions extends
		| keyof Database["public"]["Enums"]
		| { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
	  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
	  : never;
