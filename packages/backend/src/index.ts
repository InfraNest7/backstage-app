/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */
import { createBackend } from '@backstage/backend-defaults';
import { createBackendModule } from '@backstage/backend-plugin-api';
import { googleAuthenticator } from '@backstage/plugin-auth-backend-module-google-provider';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';

const customGoogleAuth = createBackendModule({
  pluginId: 'auth',
  moduleId: 'custom-google-auth-provider',
  register(reg) {
    reg.registerInit({
      deps: { providers: authProvidersExtensionPoint },
      async init({ providers }) {
        providers.registerProvider({
          providerId: 'google', // must match the config: auth.providers.google
          factory: createOAuthProviderFactory({
            authenticator: googleAuthenticator,
            async signInResolver(info, ctx) {
              const email = info.result?.fullProfile?.emails?.[0]?.value;
              if (!email) {
                throw new Error('No email found in Google profile');
              }
              return ctx.signInWithCatalogUser({
                annotations: {
                  'backstage.io/email': email,
                },
              });
            },
          }),
        });
      },
    });
  },
});

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-techdocs-backend'));

// ✅ Auth plugins
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(customGoogleAuth); // ✅ Custom Google provider only

// Catalog
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'));
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// Permissions
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(import('@backstage/plugin-permission-backend-module-allow-all-policy'));

// Search
backend.add(import('@backstage/plugin-search-backend'));
backend.add(import('@backstage/plugin-search-backend-module-pg'));
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// Kubernetes
backend.add(import('@backstage/plugin-kubernetes-backend'));

backend.start();

