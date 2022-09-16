export type CoreConfig = {
  locale: {
    main: string;
    languages: string[];
    path: string;
  };
  logs: {
    path: string;
  };
  files: {
    path: string;
  };
  redis: {
    database: number;
  };
};
