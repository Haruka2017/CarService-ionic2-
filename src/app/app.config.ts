export class AppConfig {

  /* Parse Server URL */
   public static get SERVER_URL(): string {
     return 'http://ubort.herokuapp.com/parse/';
   }

   /* Parse App ID  */
   public static get APP_ID(): string {
     return 'ubort';
   }

   /* AdMob Banner ID  */
   public static get BANNER_ID(): string {
     return '';
   }
   /* Google Analytics Tracking ID  */
   public static get TRACKING_ID(): string {
     return 'UA-91867449-1';
   }

   /* Unit: km or mi  */
   public static get DEFAULT_UNIT(): string {
     return 'mi';
   }

   /* Map style: satellite or roadmap */
   public static get DEFAULT_MAP_STYLE(): string {
     return 'MAP_TYPE_NORMAL';
   }

   public static get DEFAULT_LANG(): string {
     return 'en';
   }
}
