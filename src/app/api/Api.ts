/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Body_upload_banner_api_accounts_banner_upload_post */
export interface BodyUploadBannerApiAccountsBannerUploadPost {
  /**
   * File
   * @format binary
   */
  file: File
}

/** Body_upload_profile_api_accounts_profile_upload_post */
export interface BodyUploadProfileApiAccountsProfileUploadPost {
  /**
   * File
   * @format binary
   */
  file: File
}

/** ChangeDisplaynameBody */
export interface ChangeDisplaynameBody {
  /** New Display Name */
  new_display_name: string
}

/** ChangePasswordBody */
export interface ChangePasswordBody {
  /** Old Password */
  old_password: string
  /** New Password */
  new_password: string
}

/** ChangeUsernameBody */
export interface ChangeUsernameBody {
  /** Password */
  password: string
  /** New Username */
  new_username: string
}

/** CheckWordsBody */
export interface CheckWordsBody {
  /** Text */
  text: string
  /** Region */
  region: 'en' | 'jp'
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[]
}

/** LoginBody */
export interface LoginBody {
  /** Username */
  username: string
  /** Password */
  password: string
  /** Turnstile Response */
  turnstile_response: string
}

/** MusicSearchBody */
export interface MusicSearchBody {
  /** Query */
  query: string
  /** Region */
  region?: 'en' | 'jp' | null
  /** Difficulties */
  difficulties?:
    | ('easy' | 'normal' | 'hard' | 'expert' | 'master' | 'append')[]
    | null
}

/** SignupBody */
export interface SignupBody {
  /** Display Name */
  display_name: string
  /** Username */
  username: string
  /** Email */
  email: string
  /** Password */
  password: string
  /** Turnstile Response */
  turnstile_response: string
}

/** UpdateDescriptionBody */
export interface UpdateDescriptionBody {
  /** Description */
  description: string
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[]
  /** Message */
  msg: string
  /** Error Type */
  type: string
  /** Input */
  input?: any
  /** Context */
  ctx?: object
}

/** VerifyEmailBody */
export interface VerifyEmailBody {
  /** Token */
  token: string
}

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat
  /** request body */
  body?: unknown
  /** base url */
  baseUrl?: string
  /** request cancellation token */
  cancelToken?: CancelToken
}

export type RequestParams = Omit<
  FullRequestParams,
  'body' | 'method' | 'query' | 'path'
>

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void
  customFetch?: typeof fetch
}

export interface HttpResponse<
  D extends unknown,
  E extends unknown = unknown,
> extends Response {
  data: D
  error: E
}

type CancelToken = Symbol | string | number

export enum ContentType {
  Json = 'application/json',
  JsonApi = 'application/vnd.api+json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = ''
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private abortControllers = new Map<CancelToken, AbortController>()
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams)

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  }

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig)
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key)
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key])
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key]
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {}
    const keys = Object.keys(query).filter(
      (key) => 'undefined' !== typeof query[key],
    )
    return keys
      .map((key) =>
        Array.isArray(query[key]) ?
          this.addArrayQueryParam(query, key)
        : this.addQueryParam(query, key),
      )
      .join('&')
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery)
    return queryString ? `?${queryString}` : ''
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      (
        input !== null &&
        (typeof input === 'object' || typeof input === 'string')
      ) ?
        JSON.stringify(input)
      : input,
    [ContentType.JsonApi]: (input: any) =>
      (
        input !== null &&
        (typeof input === 'object' || typeof input === 'string')
      ) ?
        JSON.stringify(input)
      : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== 'string' ?
        JSON.stringify(input)
      : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key]
        formData.append(
          key,
          property instanceof Blob ? property
          : typeof property === 'object' && property !== null ?
            JSON.stringify(property)
          : `${property}`,
        )
        return formData
      }, new FormData())
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  }

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    }
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken)
      if (abortController) {
        return abortController.signal
      }
      return void 0
    }

    const abortController = new AbortController()
    this.abortControllers.set(cancelToken, abortController)
    return abortController.signal
  }

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken)

    if (abortController) {
      abortController.abort()
      this.abortControllers.delete(cancelToken)
    }
  }

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const queryString = query && this.toQueryString(query)
    const payloadFormatter = this.contentFormatters[type || ContentType.Json]
    const responseFormat = format || requestParams.format

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData ?
            { 'Content-Type': type }
          : {}),
        },
        signal:
          (cancelToken ?
            this.createAbortSignal(cancelToken)
          : requestParams.signal) || null,
        body:
          typeof body === 'undefined' || body === null ?
            null
          : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>
      r.data = null as unknown as T
      r.error = null as unknown as E

      const responseToParse = responseFormat ? response.clone() : response
      const data =
        !responseFormat ? r : (
          await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data
              } else {
                r.error = data
              }
              return r
            })
            .catch((e) => {
              r.error = e
              return r
            })
        )

      if (cancelToken) {
        this.abortControllers.delete(cancelToken)
      }

      // if (!response.ok) throw data
      return data
    })
  }
}

/**
 * @title FastAPI
 * @version 0.1.0
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Returns account info if the username is taken, or `404` if it is available.
     *
     * @tags Account
     * @name MainApiAccountsChecksUsernameUsernameGet
     * @summary Check username availability
     * @request GET:/api/accounts/checks/username/{username}
     */
    mainApiAccountsChecksUsernameUsernameGet: (
      username: string,
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        void | {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/checks/username/${username}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Permanently deletes the authenticated account and all associated S3 assets. Does not require email verification.
     *
     * @tags Account
     * @name DeleteAccountApiAccountsDeleteDelete
     * @summary Delete account
     * @request DELETE:/api/accounts/delete
     */
    deleteAccountApiAccountsDeleteDelete: (params: RequestParams = {}) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/delete`,
        method: 'DELETE',
        format: 'json',
        ...params,
      }),

    /**
     * @description Changes the display name for the authenticated account.
     *
     * @tags Account
     * @name MainApiAccountsDisplayNamePost
     * @summary Change display name
     * @request POST:/api/accounts/display_name
     */
    mainApiAccountsDisplayNamePost: (
      data: ChangeDisplaynameBody,
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/display_name`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Sends a verification email to the authenticated account's email address. Can be used to resend if not yet verified.
     *
     * @tags Account
     * @name SendVerificationEmailApiAccountsEmailSendPost
     * @summary Send verification email
     * @request POST:/api/accounts/email/send
     */
    sendVerificationEmailApiAccountsEmailSendPost: (
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/email/send`,
        method: 'POST',
        format: 'json',
        ...params,
      }),

    /**
     * @description Verifies email from a link clicked in the verification email. Redirects to the frontend on success.
     *
     * @tags Account
     * @name VerifyEmailGetApiAccountsEmailVerifyVerifyGet
     * @summary Verify email (browser)
     * @request GET:/api/accounts/email/verify/verify
     */
    verifyEmailGetApiAccountsEmailVerifyVerifyGet: (
      query: {
        /** Token */
        token: string
      },
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        void | {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/email/verify/verify`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Verifies email from a token submitted by the frontend. Returns new access and refresh tokens.
     *
     * @tags Account
     * @name VerifyEmailPostApiAccountsEmailVerifyVerifyPost
     * @summary Verify email (frontend)
     * @request POST:/api/accounts/email/verify/verify
     */
    verifyEmailPostApiAccountsEmailVerifyVerifyPost: (
      data: VerifyEmailBody,
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/email/verify/verify`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns the authenticated account's full profile information. Timestamps are in milliseconds since Unix epoch. `profile_hash` and `banner_hash` may be `null` if not set.
     *
     * @tags Account
     * @name GetSelfApiAccountsMeGet
     * @summary Get own account
     * @request GET:/api/accounts/me
     */
    getSelfApiAccountsMeGet: (params: RequestParams = {}) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/me`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Deletes the authenticated account's profile picture.
     *
     * @tags Account
     * @name DeleteProfileApiAccountsProfileDelete
     * @summary Delete profile picture
     * @request DELETE:/api/accounts/profile
     */
    deleteProfileApiAccountsProfileDelete: (params: RequestParams = {}) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/profile`,
        method: 'DELETE',
        format: 'json',
        ...params,
      }),

    /**
     * @description Deletes the authenticated account's banner.
     *
     * @tags Account
     * @name DeleteBannerApiAccountsBannerDelete
     * @summary Delete banner
     * @request DELETE:/api/accounts/banner
     */
    deleteBannerApiAccountsBannerDelete: (params: RequestParams = {}) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/banner`,
        method: 'DELETE',
        format: 'json',
        ...params,
      }),

    /**
     * @description Updates the authenticated account's description.
     *
     * @tags Account
     * @name UpdateDescriptionApiAccountsDescriptionPost
     * @summary Update description
     * @request POST:/api/accounts/description
     */
    updateDescriptionApiAccountsDescriptionPost: (
      data: UpdateDescriptionBody,
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/description`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Uploads a profile picture for the authenticated account. Image will be resized to 400x400 and saved as PNG and WebP. Max size: **10MB**.
     *
     * @tags Account
     * @name UploadProfileApiAccountsProfileUploadPost
     * @summary Upload profile picture
     * @request POST:/api/accounts/profile/upload
     */
    uploadProfileApiAccountsProfileUploadPost: (
      data: BodyUploadProfileApiAccountsProfileUploadPost,
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/profile/upload`,
        method: 'POST',
        body: data,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * @description Uploads a banner for the authenticated account. Image will be resized to 1200x360 and saved as PNG and WebP. Max size: **15MB**.
     *
     * @tags Account
     * @name UploadBannerApiAccountsBannerUploadPost
     * @summary Upload banner
     * @request POST:/api/accounts/banner/upload
     */
    uploadBannerApiAccountsBannerUploadPost: (
      data: BodyUploadBannerApiAccountsBannerUploadPost,
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/banner/upload`,
        method: 'POST',
        body: data,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * @description Signs into an existing account. Returns the user, access token, refresh token, and asset base URL. Timestamps are in milliseconds since Unix epoch.
     *
     * @tags Auth
     * @name MainApiAccountsLoginPost
     * @summary Sign in
     * @request POST:/api/accounts/login
     */
    mainApiAccountsLoginPost: (data: LoginBody, params: RequestParams = {}) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/login`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Changes the password for the authenticated account. Requires current password verification. All existing sessions are invalidated and new tokens are returned.
     *
     * @tags Account
     * @name MainApiAccountsPasswordPost
     * @summary Change password
     * @request POST:/api/accounts/password
     */
    mainApiAccountsPasswordPost: (
      data: ChangePasswordBody,
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/password`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Exchanges a refresh token for a new access token.
     *
     * @tags Auth
     * @name MainApiAccountsSessionRefreshPost
     * @summary Refresh access token
     * @request POST:/api/accounts/session/refresh
     */
    mainApiAccountsSessionRefreshPost: (params: RequestParams = {}) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/session/refresh`,
        method: 'POST',
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates a new account. Returns the created user, access token, refresh token, and asset base URL. Timestamps are in milliseconds since Unix epoch.
     *
     * @tags Auth
     * @name MainApiAccountsSignupPost
     * @summary Sign up
     * @request POST:/api/accounts/signup
     */
    mainApiAccountsSignupPost: (data: SignupBody, params: RequestParams = {}) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/signup`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Changes the username for the authenticated account. Requires current password verification.
     *
     * @tags Account
     * @name MainApiAccountsUsernamePost
     * @summary Change username
     * @request POST:/api/accounts/username
     */
    mainApiAccountsUsernamePost: (
      data: ChangeUsernameBody,
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/username`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns a raw asset file from the PJSK asset directory for the given region.
     *
     * @tags PJSK Assets
     * @name GetAssetApiPjskDataAssetsAssetPathGet
     * @summary Get asset file
     * @request GET:/api/pjsk_data/assets/{asset_path}
     */
    getAssetApiPjskDataAssetsAssetPathGet: (
      assetPath: string,
      query: {
        /** Region */
        region: 'en' | 'jp'
      },
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/pjsk_data/assets/${assetPath}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns a list of all comics from the PJSK master data for a given region. `image_type` defaults to `webp`. `from_user_rank` and `to_user_rank` indicate the player rank range required to unlock the comic.
     *
     * @tags PJSK Data
     * @name GetComicsApiPjskDataComicsGet
     * @summary Get comics
     * @request GET:/api/pjsk_data/comics
     */
    getComicsApiPjskDataComicsGet: (
      query: {
        /** Region */
        region: 'en' | 'jp'
        /**
         * Image Type
         * @default "webp"
         */
        image_type?: 'png' | 'webp'
      },
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/pjsk_data/comics`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns the current PJSK event data including the top 100 leaderboard and ranking borders. `event_status` is one of `going`, `counting`, or `end`. Data is cached for **5 minutes** - `next_available_update` indicates when fresh data will be available. If there is no active event, `event_id` will be `null` and no leaderboard or border data is returned. If the request fails but cached data exists, the response will include a `cached_data` key with the last successful result.
     *
     * @tags PJSK Data
     * @name CurrentEventApiPjskDataCurrentEventGet
     * @summary Current event
     * @request GET:/api/pjsk_data/current_event
     */
    currentEventApiPjskDataCurrentEventGet: (
      query: {
        /** Region */
        region: 'en' | 'jp'
      },
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        } | void
      >({
        path: `/api/pjsk_data/current_event`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns the current PJSK ranked season data including the top 100 leaderboard. `season_status` is one of `going` or `end`. Data is cached for **5 minutes** - `next_available_update` indicates when fresh data will be available. If there is no active season, `season_id` will be `null` and no leaderboard data is returned. If the request fails but cached data exists, the response will include a `cached_data` key with the last successful result.
     *
     * @tags PJSK Data
     * @name CurrentRankedApiPjskDataCurrentRankedGet
     * @summary Current ranked season
     * @request GET:/api/pjsk_data/current_ranked
     */
    currentRankedApiPjskDataCurrentRankedGet: (
      query: {
        /** Region */
        region: 'en' | 'jp'
      },
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        } | void
      >({
        path: `/api/pjsk_data/current_ranked`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns a simplified list of all musics for a given region, including only ID, title, difficulties, and jacket URL.
     *
     * @tags PJSK Data
     * @name GetMusicsSimpleApiPjskDataMusicsSimpleGet
     * @summary Get musics (simple)
     * @request GET:/api/pjsk_data/musics/simple
     */
    getMusicsSimpleApiPjskDataMusicsSimpleGet: (
      query: {
        /** Region */
        region: 'en' | 'jp'
        /**
         * Image Type
         * @default "webp"
         */
        image_type?: 'webp' | 'png'
      },
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/pjsk_data/musics/simple`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns a compiled list of all musics for a given region, including vocals, difficulties, tags, collaboration, and original video.
     *
     * @tags PJSK Data
     * @name GetMusicsApiPjskDataMusicsGet
     * @summary Get musics
     * @request GET:/api/pjsk_data/musics
     */
    getMusicsApiPjskDataMusicsGet: (
      query: {
        /** Region */
        region: 'en' | 'jp'
        /**
         * Image Type
         * @default "webp"
         */
        image_type?: 'webp' | 'png'
      },
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/pjsk_data/musics`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Fuzzy search musics by title. Returns a list of matching music IDs sorted by relevance (closest first). `region` is optional — if omitted, searches across all regions. `difficulties` optionally filters to only songs that have ALL specified difficulties.
     *
     * @tags PJSK Data
     * @name SearchMusicsApiPjskDataMusicsSearchPost
     * @summary Search musics
     * @request POST:/api/pjsk_data/musics/search
     */
    searchMusicsApiPjskDataMusicsSearchPost: (
      data: MusicSearchBody,
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/pjsk_data/musics/search`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns a list of all stamps from the PJSK master data for a given region. `image_url` points to the stamp image and `balloon_url` points to the balloon overlay. `image_type` defaults to `webp`. `published_at` is in milliseconds since Unix epoch.
     *
     * @tags PJSK Data
     * @name GetStampsApiPjskDataStampsGet
     * @summary Get stamps
     * @request GET:/api/pjsk_data/stamps
     */
    getStampsApiPjskDataStampsGet: (
      query: {
        /** Region */
        region: 'en' | 'jp'
        /**
         * Image Type
         * @default "webp"
         */
        image_type?: 'png' | 'webp'
      },
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/pjsk_data/stamps`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns a PNG image of the chart for a given music ID, difficulty, and region. If the chart has not been generated yet, it will be generated on first request — this may take a while. Subsequent requests are served from cache. `mirrored` flips the lanes horizontally and is never cached.
     *
     * @tags PJSK Tools
     * @name GetChartApiToolsChartViewerGet
     * @summary Get chart image
     * @request GET:/api/tools/chart_viewer
     */
    getChartApiToolsChartViewerGet: (
      query: {
        /** Music Id */
        music_id: number
        /** Difficulty */
        difficulty: 'easy' | 'normal' | 'hard' | 'expert' | 'master' | 'append'
        /** Region */
        region: 'en' | 'jp'
        /**
         * Mirrored
         * @default false
         */
        mirrored?: boolean
      },
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/tools/chart_viewer`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns the character index ranges of inappropriate text based on PJSK's block and allow word lists for a given region. `start` and `end` are indexes (0 based, inclusive) text. Overlapping ranges are merged. An empty array means the text is clean.
     *
     * @tags PJSK Tools
     * @name MainApiToolsWhyInappropriatePost
     * @summary Check inappropriate text
     * @request POST:/api/tools/why_inappropriate
     */
    mainApiToolsWhyInappropriatePost: (
      data: CheckWordsBody,
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/tools/why_inappropriate`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns public profile information for an account. Banned accounts return `404`. Timestamps are in milliseconds since Unix epoch. `profile_hash` and `banner_hash` may be `null` if not set.
     *
     * @tags Account
     * @name GetAccountApiAccountsUsernameGet
     * @summary Get account by username
     * @request GET:/api/accounts/{username}
     */
    getAccountApiAccountsUsernameGet: (
      username: string,
      params: RequestParams = {},
    ) =>
      this.request<
        any,
        {
          /** @example "detail_code" */
          detail?: string
        }
      >({
        path: `/api/accounts/${username}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  }
}

const mainApi = new Api({ baseUrl: process.env.API_URL })
export default mainApi
