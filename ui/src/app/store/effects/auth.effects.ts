import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { formatCurrentUserDetails } from "src/app/core/helpers/current-user.helper";
import {
  Notification,
  NotificationService,
} from "src/app/shared/services/notification.service";
import { AuthService } from "../../core/services/auth.service";
import {
  addAuthenticatedUser,
  addSessionStatus,
  authenticateUser,
  authenticateUserFail,
  go,
  logoutUser,
  logoutUserFail,
  loadProviderDetails,
  setUserLocations,
  loadAllLocations,
  addLoadedUserDetails,
  loadRolesDetails,
  clearLocations,
} from "../actions";
import { initiateEncounterType } from "../actions/encounter-type.actions";

@Injectable()
export class AuthEffects {
  authenticate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authenticateUser),
      switchMap(({ credentialsToken }) =>
        this.authService.login(credentialsToken).pipe(
          switchMap(
            ({
              authenticatedUser,
              authenticated,
              userUuid,
              loginResponse,
              user,
              userLocations,
            }) => {
              if (authenticated) {
                sessionStorage.setItem("JSESSIONID", loginResponse?.sessionId);
                localStorage.setItem("credentialsToken", credentialsToken);
                localStorage.setItem("userUuid", user.uuid);
              }

              console.log(authenticated ? 2 : 5);
              console.log("slk.ciosahnc.sah");
              console.log(authenticatedUser);
              return authenticated
                ? [
                    go({ path: [""] }),
                    setUserLocations({ userLocations }),
                    loadProviderDetails({ userUuid }),
                    addLoadedUserDetails({
                      userDetails: formatCurrentUserDetails(authenticatedUser),
                    }),
                    loadRolesDetails(),
                    addSessionStatus({authenticated}),
                    loadAllLocations(),
                    initiateEncounterType(),
                  ]
                : [
                    authenticateUserFail({
                      error: {
                        status: 403,
                        message: "incorrect username or password",
                      },
                    }),
                  ];
            }
          ),
          catchError((error: any) => {
            // TODO: Add support to have a more readable error messages
            return of(authenticateUserFail({ error }));
          })
        )
      )
    )
  );

  logout$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(logoutUser),
      switchMap(() => {
        this.notificationService.show(
          new Notification({ message: "Logging out", type: "LOADING" })
        );
        document.cookie = `JSESSIONID= ;expires=${new Date()}`;
        localStorage.removeItem("credentialsToken");
        localStorage.removeItem("currentLocation");
        localStorage.removeItem("navigationDetails");
        return this.authService.logout().pipe(
          switchMap(() => [
            clearLocations(),
            go({ path: ["/login"] }),
            addSessionStatus({ authenticated: false }),
          ]),
          catchError((error) => of(logoutUserFail({ error })))
        );
      })
    );
  });

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}
}
