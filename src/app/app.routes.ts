import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home/home.component')
      .then(m => m.HomeComponent)
  },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/components/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'payment/success',
    canActivate: [authGuard],
    loadComponent: () => import('./features/client/pages/paiements/paiements.component')
      .then(m => m.ClientPaiementsComponent)
  },
  {
    path: 'payment/cancel',
    canActivate: [authGuard],
    loadComponent: () => import('./features/client/pages/paiements/paiements.component')
      .then(m => m.ClientPaiementsComponent)
  },

  // Admin routes
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component')
      .then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'voyages', pathMatch: 'full' },
      {
        path: 'voyages',
        loadComponent: () => import('./features/admin/pages/voyages/voyage-list/voyage-list.component')
          .then(m => m.VoyageListComponent)
      },
      {
        path: 'voyages/nouveau',
        loadComponent: () => import('./features/admin/pages/voyages/voyage-form/voyage-form.component')
          .then(m => m.VoyageFormComponent)
      },
      {
        path: 'voyages/:id/modifier',
        loadComponent: () => import('./features/admin/pages/voyages/voyage-form/voyage-form.component')
          .then(m => m.VoyageFormComponent)
      },
      {
        path: 'activites',
        loadComponent: () => import('./features/admin/pages/activites/activite-list/activite-list.component')
          .then(m => m.ActiviteListComponent)
      },
      {
        path: 'activites/nouveau',
        loadComponent: () => import('./features/admin/pages/activites/activite-form/activite-form.component')
          .then(m => m.ActiviteFormComponent)
      },
      {
        path: 'activites/:id/modifier',
        loadComponent: () => import('./features/admin/pages/activites/activite-form/activite-form.component')
          .then(m => m.ActiviteFormComponent)
      },
      {
        path: 'reservations',
        loadComponent: () => import('./features/admin/pages/reservations/reservations.component')
          .then(m => m.AdminReservationsComponent)
      },
      {
        path: 'paiements',
        loadComponent: () => import('./features/admin/pages/paiements/paiements.component')
          .then(m => m.AdminPaiementsComponent)
      },
      {
        path: 'utilisateurs',
        loadComponent: () => import('./features/admin/pages/utilisateurs/utilisateurs.component')
          .then(m => m.AdminUtilisateursComponent)
      },
      {
        path: 'statistiques',
        loadComponent: () => import('./features/admin/pages/statistiques/statistiques.component')
          .then(m => m.AdminStatistiquesComponent)
      }
    ]
  },

  // Client routes
  {
    path: 'client',
    loadComponent: () => import('./layouts/client-layout/client-layout.component')
      .then(m => m.ClientLayoutComponent),
    children: [
      { path: '', redirectTo: 'voyages', pathMatch: 'full' },
      {
        path: 'voyages',
        loadComponent: () => import('./features/client/pages/voyages/voyage-list/voyage-list.component')
          .then(m => m.ClientVoyageListComponent)
      },
      {
        path: 'voyages/:id',
        loadComponent: () => import('./features/client/pages/voyages/voyage-detail/voyage-detail.component')
          .then(m => m.VoyageDetailComponent)
      },
      {
        path: 'activites',
        canActivate: [authGuard],
        loadComponent: () => import('./features/client/pages/activites/activite-list/activite-list.component')
          .then(m => m.ClientActiviteListComponent)
      },
      {
        path: 'reservations',
        canActivate: [authGuard],
        loadComponent: () => import('./features/client/pages/reservations/reservations.component')
          .then(m => m.ClientReservationsComponent)
      },
      {
        path: 'paiements',
        canActivate: [authGuard],
        loadComponent: () => import('./features/client/pages/paiements/paiements.component')
          .then(m => m.ClientPaiementsComponent)
      },
      {
        path: 'profil',
        canActivate: [authGuard],
        loadComponent: () => import('./features/client/pages/profil/profil.component')
          .then(m => m.ClientProfilComponent)
      }
    ]
  },

  {
    path: '**',
    loadComponent: () => import('./features/home/pages/home/home.component')
      .then(m => m.HomeComponent)
  }
];
