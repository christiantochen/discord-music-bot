export interface GuildSettings {
  id: string;
  language: string;
}

export default (id: string): GuildSettings => ({
  id,
  language: "en-US",
});
