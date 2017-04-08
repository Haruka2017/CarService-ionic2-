import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { EmptyView } from '../components/empty-view/empty-view';

import { AddPlacePage } from '../pages/add-place-page/add-place-page';
import { CategoriesPage } from '../pages/categories/categories';
import { PlacesPage } from '../pages/places/places';
import { PlaceDetailPage } from '../pages/place-detail-page/place-detail-page';
import { AddReviewPage } from '../pages/add-review-page/add-review-page';
import { ReviewsPage } from '../pages/reviews-page/reviews-page';
import { SettingsPage } from '../pages/settings-page/settings-page';
import { MapPage } from '../pages/map-page/map-page';
import { FavoritesPage } from '../pages/favorites-page/favorites-page';
import { WalkthroughPage } from '../pages/walkthrough-page/walkthrough-page';
import { SignInPage } from '../pages/sign-in-page/sign-in-page';
import { SignUpPage } from '../pages/sign-up-page/sign-up-page';
import { ProfilePage } from '../pages/profile-page/profile-page';
import { EditProfilePage } from '../pages/edit-profile-page/edit-profile-page';

import { Category } from '../providers/categories';
import { Place } from '../providers/place-service';
import { Review } from '../providers/review-service';
import { ParseFile } from '../providers/parse-file-service';
import { User } from '../providers/user-service';
import { LocalStorage } from '../providers/local-storage';
import { Preference } from '../providers/preference';
import { MapStyle } from '../providers/map-style';

import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { Ionic2RatingModule } from 'ionic2-rating';
import { Ng2ImgFallbackModule } from 'ng2-img-fallback';
import { LazyLoadImageModule } from 'ng2-lazyload-image';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';

export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, './assets/i18n', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    EmptyView,
    AddPlacePage,
    CategoriesPage,
    PlacesPage,
    PlaceDetailPage,
    AddReviewPage,
    ReviewsPage,
    SettingsPage,
    MapPage,
    WalkthroughPage,
    FavoritesPage,
    SignInPage,
    SignUpPage,
    ProfilePage,
    EditProfilePage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    Ionic2RatingModule,
    Ng2ImgFallbackModule,
    LazyLoadImageModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AddPlacePage,
    CategoriesPage,
    PlacesPage,
    PlaceDetailPage,
    AddReviewPage,
    ReviewsPage,
    SettingsPage,
    MapPage,
    WalkthroughPage,
    FavoritesPage,
    SignInPage,
    SignUpPage,
    ProfilePage,
    EditProfilePage
  ],
  providers: [Category, Place, ParseFile, Review, LocalStorage, Storage, User,
    Preference, MapStyle, { provide: ErrorHandler, useClass: IonicErrorHandler }]
})
export class AppModule {}
