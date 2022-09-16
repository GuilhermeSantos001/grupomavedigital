import { RepositoryContract } from '@/core/contracts/repository.contract';
import { UserDatabaseContract } from '@/users/contracts/users-database.contract';

import { User } from '@prisma/client';
import { UserEntity } from '@/users/entities/users.entity';

import { GeoIP } from '@/core/types/geo-ip.type';

import { JsonWebToken } from '@/core/libs/jwt.lib';
import { Random } from '@/core/utils/random.util';

import { RecursivePartial } from '@/core/common/types/recursive-partial.type';
import { SimilarityType } from '@/core/utils/similarity-filter.util';

import { Session } from '@/users/types/session.type';

import * as _ from 'lodash';

export class UserRepository extends RepositoryContract<
  User,
  UserEntity,
  UserDatabaseContract
> {
  private get _signature(): string {
    return Random.STRING(12, { specials: ['-', '_'] });
  }

  private get _getExpireDateAccessToken() {
    return ((now) => {
      now.setMinutes(now.getMinutes() + 15); // ! 15 minutes
      return now.toISOString();
    })(new Date());
  }

  private get _getExpireDateAccessTokenRevalidate() {
    return ((now) => {
      now.setDate(now.getDate() + 1); // ! 1 day
      return now.toISOString();
    })(new Date());
  }

  private get _getJsonWebTokenData() {
    return {
      timestamp: `${Date.now()}-${this.database.generateID()}`,
    };
  }

  private _sessionDefault(user: UserEntity) {
    let { session } = user;

    session = {
      activeClients: 0,
      limitClients: 4,
      accessTokens: [],
      accessTokenRevalidate: null,
      history: {
        devices: [],
        accessTokensCanceled: [],
        loginInNewIpAddressAlerts: [],
      },
      allowedDevices: [],
      loginFailure: {
        attemptsCount: 0,
        attemptsLimit: 5,
        attemptsTimeout: null,
      },
      geoip: [],
      banned: false,
      ipAddressWhitelist: [],
      ipAddressBlacklist: [],
    };

    return session;
  }

  private async _loginFailureProcessAttempt(user: UserEntity) {
    let { loginFailure } = user.session as Session;

    if (!loginFailure)
      loginFailure = {
        attemptsCount: 0,
        attemptsLimit: 5,
      };

    loginFailure.attemptsCount++;

    return loginFailure;
  }

  private async _loginFailureCheckIsExceedAttempts(
    loginFailure: Session['loginFailure'],
  ) {
    if (!loginFailure)
      loginFailure = {
        attemptsCount: 0,
        attemptsLimit: 5,
      };

    if (loginFailure.attemptsCount >= loginFailure.attemptsLimit) {
      if (typeof loginFailure.attemptsTimeout !== 'string') {
        const now = new Date();

        now.setMinutes(now.getMinutes() + 20);

        loginFailure.attemptsTimeout = now.toISOString();
      } else {
        if (new Date(loginFailure.attemptsTimeout) > new Date())
          return new Error(
            this.locale.translate(
              'customers.repository.session_inactive',
            ) as string,
          );

        loginFailure.attemptsTimeout = null;
      }
    }

    return loginFailure;
  }

  private _loginFailureReset(user: UserEntity) {
    let { loginFailure } = user.session as Session;

    loginFailure = {
      attemptsCount: 0,
      attemptsLimit: 5,
      attemptsTimeout: null,
    };

    return loginFailure;
  }

  private _addedAccessToken(user: UserEntity, ipAddress: string) {
    const { accessTokens } = user.session as Session;

    const jwt = new JsonWebToken(this._getJsonWebTokenData);

    accessTokens.push({
      value: jwt.save(user.password, '15m') as string,
      signature: this._signature,
      ipAddress,
      expireIn: this._getExpireDateAccessToken,
      createdAt: this.createdAt.toISOString(),
    });

    return accessTokens;
  }

  private _addedAccessTokenRevalidate(user: UserEntity, ipAddress: string) {
    let { accessTokenRevalidate } = user.session as Session;

    const jwt = new JsonWebToken(this._getJsonWebTokenData);

    if (
      !accessTokenRevalidate ||
      new Date(accessTokenRevalidate.expireIn) < new Date()
    )
      accessTokenRevalidate = {
        value: jwt.save(user.password, '1d') as string,
        signature: this._signature,
        ipAddress,
        expireIn: this._getExpireDateAccessTokenRevalidate,
        createdAt: this.createdAt.toISOString(),
      };

    return accessTokenRevalidate;
  }

  private _addedDeviceHistory(
    user: UserEntity,
    name: string,
    accessTokenValue: string,
    ipAddress: string,
  ) {
    const {
      history: { devices },
    } = user.session as Session;

    devices.push({
      name,
      accessTokenValue,
      ipAddress,
    });

    return devices;
  }

  private _updateHashFields(
    fields: string[],
    beforeData: User,
    nextData: Partial<User>,
  ) {
    for (const field of fields) {
      if (
        nextData[field] &&
        beforeData[field] !== nextData[field] &&
        !this.database.compareHashText(nextData[field], beforeData.hash[field])
      ) {
        if (!nextData.hash) nextData.hash = {};

        nextData.hash[field] = this.database.hashByText(nextData[field]);
        nextData[field] = this.database.encrypt(nextData[field]);
      }
    }

    return nextData;
  }

  private async _findBySameField(field: string, value: string) {
    if ((await this.database.findBy({ [field]: value })).length > 0)
      return new Error(
        this.locale.translate(
          'customers.repository.customer_already_exists',
          field,
          value,
        ) as string,
      );
  }

  private async _findBySameFieldExceptionWithID(
    id: string,
    field: string,
    value: string,
  ) {
    if (
      (await this.database.findBy({ [field]: value })).filter(
        (user) => user.id !== id,
      ).length > 0
    )
      return new Error(
        this.locale.translate(
          'customers.repository.field_in_use',
          field,
          value,
        ) as string,
      );
  }

  public async beforeSave(model: User): Promise<User> {
    model.email = this.database.encrypt(model.email);
    model.password = await this.database.hashByPassword(model.password);

    return model;
  }

  public async beforeUpdate(
    beforeData: User,
    nextData: Partial<User>,
  ): Promise<User> {
    if (
      nextData.password &&
      beforeData.password !== nextData.password &&
      !(await this.database.compareHashPassword(
        nextData.password,
        beforeData.password,
      ))
    )
      nextData.password = await this.database.hashByPassword(nextData.password);

    nextData = this._updateHashFields(['email'], beforeData, nextData);

    return { ...beforeData, ...nextData };
  }

  public async decryptFieldValue(value: string): Promise<string> {
    return this.database.decrypt(value);
  }

  public async register(model: User): Promise<UserEntity | Error> {
    const findByUsername = await this._findBySameField(
      'username',
      model.username,
    );

    if (findByUsername instanceof Error)
      return new Error(findByUsername.message);

    const findByEmail = await this.database.findByEmail(model.email);

    if (findByEmail)
      return new Error(
        this.locale.translate(
          'customers.repository.customer_already_exists',
          'email',
          model.email,
        ) as string,
      );

    return await this.database.create(await this.beforeSave(model));
  }

  public async findMany(): Promise<UserEntity[]> {
    return await this.database.findAll();
  }

  public async findById(id: string): Promise<UserEntity | Error> {
    const user = await this.database.findOne(id);

    if (!user)
      return new Error(
        this.locale.translate(
          'customers.repository.customer_not_exists',
          'id',
          id,
        ) as string,
      );

    return user;
  }

  public async findBy(
    filter: RecursivePartial<User>,
    similarity?: SimilarityType,
  ): Promise<UserEntity[]> {
    return await this.database.findBy(filter, similarity);
  }

  public async update(
    id: string,
    newData: Partial<User>,
  ): Promise<UserEntity | Error> {
    const user = await this.findById(id);

    if (user instanceof Error) return new Error(user.message);

    const findByUsername = await this._findBySameFieldExceptionWithID(
      newData.id,
      'username',
      newData.username,
    );

    if (findByUsername instanceof Error)
      return new Error(findByUsername.message);

    if (
      ((user) => (user ? user.id !== newData.id : false))(
        await this.database.findByEmail(newData.email || '???'),
      )
    )
      return new Error(
        this.locale.translate(
          'customers.repository.field_in_use',
          'email',
          newData.email,
        ) as string,
      );

    return await this.database.update(
      id,
      await this.beforeUpdate(_.omit(user, ['roles']), { ...newData }),
    );
  }

  public async remove(id: string): Promise<boolean | Error> {
    const user = await this.findById(id);

    if (user instanceof Error) return new Error(user.message);

    return await this.database.remove(user.id);
  }

  public async login(
    email: string,
    password: string,
    device_name: string,
    geo_ip: GeoIP,
  ): Promise<UserEntity | Error> {
    let user = await this.database.findByEmail(email);

    if (!user)
      return new Error(
        this.locale.translate(
          'customers.repository.customer_not_exists',
          'email',
          email,
        ) as string,
      );

    if (!user.activate)
      return new Error(
        this.locale.translate(
          'customers.repository.customer_account_not_activate',
        ) as string,
      );

    if (_.isEmpty(user.session)) user.session = this._sessionDefault(user);

    let loginFailure;

    if (!(await this.database.compareHashPassword(password, user.password))) {
      loginFailure = await this._loginFailureProcessAttempt(user);
      loginFailure = await this._loginFailureCheckIsExceedAttempts(
        loginFailure,
      );

      if (loginFailure instanceof Error) return new Error(loginFailure.message);

      user.session['loginFailure'] = loginFailure;

      await this.update(user.id, _.omit(user, ['roles']));

      return new Error(
        this.locale.translate(
          'customers.repository.password_incorrect',
        ) as string,
      );
    }

    loginFailure = await this._loginFailureCheckIsExceedAttempts(
      user.session['loginFailure'],
    );

    if (loginFailure instanceof Error) return new Error(loginFailure.message);

    user.session['loginFailure'] = this._loginFailureReset(user);

    if (user.session['banned'])
      return new Error(
        this.locale.translate(
          'customers.repository.customer_is_banned',
          'email',
          email,
        ) as string,
      );

    if (user.session['activeClients'] >= user.session['limitClients']) {
      let userUpdated;

      for (const token of user.session['accessTokens']) {
        if (new Date(token.expireIn) < new Date())
          userUpdated = await this.logout(user.id, token.value);
      }

      if (userUpdated instanceof Error) return new Error(userUpdated.message);

      if (
        !userUpdated ||
        (userUpdated &&
          userUpdated.session.activeClients >= userUpdated.session.limitClients)
      )
        return new Error(
          this.locale.translate(
            'customers.repository.customer_session_exceed_limit',
            'email',
            email,
            user.session['limitClients'].toString(),
          ) as string,
        );

      if (userUpdated) user = userUpdated;
    }

    if (
      user.session['ipAddressWhitelist'].length > 0 &&
      user.session['ipAddressWhitelist'].indexOf(geo_ip.ipAddress) <= -1
    )
      return new Error(
        this.locale.translate(
          'customers.repository.customer_session_ipAddress_not_allowed',
          geo_ip.ipAddress,
        ) as string,
      );

    if (
      user.session['ipAddressBlacklist'].length > 0 &&
      user.session['ipAddressBlacklist'].indexOf(geo_ip.ipAddress) !== -1
    )
      return new Error(
        this.locale.translate(
          'customers.repository.customer_session_ipAddress_is_blocked',
          geo_ip.ipAddress,
        ) as string,
      );

    if (
      user.session['allowedDevices'].length > 0 &&
      user.session['allowedDevices'].indexOf(device_name) <= 0
    )
      return new Error(
        this.locale.translate(
          'customers.repository.customer_session_device_not_allowed',
          device_name,
        ) as string,
      );

    if (
      user.session['accessTokens'].find(
        (token) => token.ipAddress === geo_ip.ipAddress,
      )
    ) {
      await this.logout(
        user.id,
        user.session['accessTokens'].find(
          (token) => token.ipAddress === geo_ip.ipAddress,
        ).value,
      );
    }

    user.session['activeClients']++;
    user.session['accessTokens'] = this._addedAccessToken(
      user,
      geo_ip.ipAddress,
    );
    user.session['accessTokenRevalidate'] = this._addedAccessTokenRevalidate(
      user,
      geo_ip.ipAddress,
    );

    user.session['history'].devices = this._addedDeviceHistory(
      user,
      device_name,
      user.session['accessTokens'].at(-1).value,
      geo_ip.ipAddress,
    );

    user.session['geoip'].push({
      ...geo_ip,
      token_signature: user.session['accessTokens'].at(-1).signature,
    });

    if (
      user.session['history'].loginInNewIpAddressAlerts.indexOf(
        geo_ip.ipAddress,
      ) === -1
    ) {
      // TODO: Added e-mail alert in queue send mails
      // ! The user logged in new IP not secure, his confirm?

      user.session['history'].loginInNewIpAddressAlerts.push(geo_ip.ipAddress);
    }

    return await this.update(user.id, _.omit(user, ['roles']));
  }

  public async sessionValidate(
    id: string,
    token_value: string,
    token_signature: string,
    token_revalidate_value: string,
    token_revalidate_signature: string,
    device_name: string,
    geo_ip: GeoIP,
  ) {
    const user = await this.database.findOne(id);

    if (!user)
      return new Error(
        this.locale.translate(
          'customers.repository.customer_not_exists',
          'id',
          id,
        ) as string,
      );

    const email = this.database.decrypt(user.email);

    if (user.session['activeClients'] <= 0)
      return new Error(
        this.locale.translate(
          'customers.repository.customers_not_connected',
          'email',
          email,
        ) as string,
      );

    if (
      user.session['history'].accessTokensCanceled.find(
        (token) => token.value === token_value,
      )
    )
      return new Error(
        this.locale.translate(
          'customers.repository.session_canceled',
        ) as string,
      );

    if (
      !user.session['geoip'].find(
        (geoip) => geoip.token_signature === token_signature,
      ) ||
      ((geoip) => {
        if (
          geoip.city !== geo_ip.city ||
          geoip.country !== geo_ip.country ||
          geoip.ipAddress !== geo_ip.ipAddress ||
          geoip.region !== geo_ip.region ||
          geoip.timezone !== geo_ip.timezone
        )
          return true;

        return false;
      })(
        user.session['geoip'].find(
          (geoip) => geoip.token_signature === token_signature,
        ),
      )
    )
      return new Error(
        this.locale.translate(
          'customers.repository.session_geoip_not_equal_stored',
        ) as string,
      );

    const jwt = new JsonWebToken(this._getJsonWebTokenData),
      accessToken = user.session['accessTokens'].find(
        (token) =>
          token.value === token_value && token.signature === token_signature,
      );

    if (!accessToken)
      return new Error(
        this.locale.translate(
          'customers.repository.customer_not_connected',
          'email',
          email,
        ) as string,
      );

    if (accessToken.ipAddress !== geo_ip.ipAddress) {
      return new Error(
        this.locale.translate(
          'customers.repository.session_access_token_is_not_same_ip_address',
          geo_ip.ipAddress,
        ) as string,
      );
    }

    if (
      !user.session['history'].devices.find(
        (device) =>
          device.name === device_name &&
          device.accessTokenValue === accessToken.value &&
          device.ipAddress === geo_ip.ipAddress,
      )
    )
      return new Error(
        this.locale.translate(
          'customers.repository.session_device_is_not_same_in_history',
          device_name,
        ) as string,
      );

    if (
      new Date(accessToken.expireIn) < new Date() ||
      jwt.load(accessToken.value, user.password) instanceof Error
    ) {
      const { accessTokenRevalidate } = user.session as Session;

      if (new Date(accessTokenRevalidate.expireIn) > new Date()) {
        if (
          accessTokenRevalidate.value !== token_revalidate_value ||
          accessTokenRevalidate.signature !== token_revalidate_signature
        ) {
          await this.logout(id, token_value);

          return new Error(
            this.locale.translate(
              'customers.repository.session_token_revalidate_is_invalid',
            ) as string,
          );
        }

        if (accessTokenRevalidate.ipAddress !== geo_ip.ipAddress) {
          await this.logout(id, token_value);

          return new Error(
            this.locale.translate(
              'customers.repository.session_token_revalidate_ipAddress_is_not_stored',
              geo_ip.ipAddress,
            ) as string,
          );
        }

        const token_canceled = user.session['accessTokens'].find(
          (token) => token.value === token_value,
        );

        if (token_canceled)
          user.session['history'].accessTokensCanceled.push(token_canceled);

        user.session['accessTokens'] = user.session['accessTokens'].filter(
          (token) => token.value !== token_value,
        );

        user.session['accessTokens'] = this._addedAccessToken(
          user,
          geo_ip.ipAddress,
        );

        for (const geoip of user.session['geoip']) {
          if (geoip.token_signature === token_canceled.signature) {
            geoip.token_signature =
              user.session['accessTokens'].at(-1).signature;
          }
        }

        for (const device of user.session['history'].devices) {
          if (device.accessTokenValue === token_canceled.value) {
            device.accessTokenValue = user.session['accessTokens'].at(-1).value;
          }
        }

        const userUpdated = await this.update(id, _.omit(user, ['roles']));

        if (userUpdated instanceof Error) return new Error(userUpdated.message);

        return {
          token_value: userUpdated.session['accessTokens'].at(-1).value,
          token_signature: userUpdated.session['accessTokens'].at(-1).signature,
        };
      }

      await this.logout(id, token_value);

      return new Error(
        this.locale.translate(
          'customers.repository.session_access_token_expired',
        ) as string,
      );
    } else {
      return {
        token_value: user.session['accessTokens'].find(
          (token) => token.value === token_value,
        ).value,
        token_signature: user.session['accessTokens'].find(
          (token) => token.value === token_value,
        ).signature,
      };
    }
  }

  public async logout(id: string, token_value: string) {
    const user = await this.database.findOne(id);

    if (!user)
      return new Error(
        this.locale.translate(
          'customers.repository.customer_not_exists',
          'id',
          id,
        ) as string,
      );

    if (_.isEmpty(user.session))
      return new Error(
        this.locale.translate(
          'customers.repository.customer_not_connected',
          'id',
          id,
        ) as string,
      );

    user.session['history'].accessTokensCanceled = user.session[
      'history'
    ].accessTokensCanceled.filter(
      (token) => new Date() < new Date(token.expireIn),
    );

    const token_canceled = user.session['accessTokens'].find(
      (token) => token.value === token_value,
    );

    if (token_canceled)
      user.session['history'].accessTokensCanceled.push(token_canceled);

    user.session['history'].devices = user.session['history'].devices.filter(
      (device) => device.accessTokenValue !== token_value,
    );

    if (user.session['activeClients'] > 0) user.session['activeClients'] -= 1;
    user.session['geoip'] = user.session['geoip'].filter(
      (geoip) =>
        geoip.token_signature !==
        user.session['accessTokens'].find(
          (token) => token.value === token_value,
        ).signature,
    );

    if (user.session['activeClients'] <= 0)
      user.session['accessTokenRevalidate'] = null;

    user.session['accessTokens'] = user.session['accessTokens'].filter(
      (token) => token.value !== token_value,
    );

    return await this.update(user.id, _.omit(user, ['roles']));
  }
}
