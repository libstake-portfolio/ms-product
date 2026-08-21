# money

커머스에서 돈을 다루는 데 필요한 **메타데이터, 계산, 표시**를 제공하는 순수 TypeScript 라이브러리.

이 라이브러리는 **비즈니스 결정을 내리지 않는다.** 통화가 몇 자리까지 표현되는지 알려주지만 언제 반올림할지는 정하지 않고, 정밀한 산술을 제공하지만 어느 시점에 값을 확정할지는 정하지 않으며, 로케일에 맞춰 금액을 쓰지만 어느 로케일인지는 묻는다. 그 결정들은 전부 호출자의 몫이다.

현재는 이 서비스 안에 있지만 별도 저장소로 분리해 패키지로 배포할 것을 전제로 만들어졌다. 프로젝트 내부 코드에 의존하지 않으며, 유일한 외부 의존은 `decimal.js`다.

---

## 목차

- [경계](#경계)
- [빠른 사용](#빠른-사용)
- [공개 표면](#공개-표면)
- [지켜지는 규칙](#지켜지는-규칙)
- [통화 데이터](#통화-데이터)
- [런북](#런북)
- [알려진 제약](#알려진-제약)

---

## 경계

| 이 라이브러리가 소유 | 호출자가 소유 |
| --- | --- |
| 통화 메타데이터 (ISO 4217, CLDR) | 반올림 **모드** |
| 정밀 산술, 통화 혼합 금지 | **언제** 값을 확정할지 |
| 배분 알고리즘 | 저장 스키마와 저장 시점 |
| 표시 포맷 실행 | 표시 로케일, 취급 통화 정책 |

### 진입점

`index.ts`가 전체 공개 표면이다. 여기에 없는 것은 내부 구현이며 예고 없이 바뀐다. 소비자는 파일을 직접 참조하지 않는다.

```ts
import { MoneyBag, allocate, formatMoney } from '@common/libs/money';
```

이 규칙은 린트로 강제된다. 라이브러리 내부 파일을 직접 import하면 오류다.

### 의존성

`decimal.js`는 **peer dependency로 다뤄야 한다.** 이 라이브러리는 금액을 `Decimal`로 주고받으므로, 소비자가 다른 사본을 로드하면 값이 서로 같게 비교되면서도 `instanceof` 검사에는 실패한다. CommonJS 빌드와 ESM 빌드를 섞어 쓰는 경우가 대표적이다.

그 외에 소비자에게 요구하는 것은 없다. TypeScript 설정도 건드리지 않는다.

---

## 빠른 사용

```ts
import Decimal from 'decimal.js';
import { MoneyBag, allocate, describeCurrency, formatMoney, getCurrency } from '@common/libs/money';

const price = MoneyBag.of('19900', 'KRW');
const total = price.times(3); // 59700 KRW, 반올림 없음

// 할인을 라인별로 안분한다. 나머지 1원도 잃지 않는다.
const discount = MoneyBag.of('10000', 'KRW');
const shares = allocate(discount, [3, 1, 1]); // 6000, 2000, 2000

// 저장 직전에만 확정한다. 모드는 호출자가 고른다.
const { amount, currencyCode } = total.serialize(Decimal.ROUND_HALF_UP);

// 표시는 로케일이 정한다.
formatMoney(total, 'ko-KR'); // "₩59,700"

// 통화 자체에 대해서도 물어볼 수 있다.
getCurrency('KRW'); // { code: 'KRW', numericCode: '410', minorUnits: 0, name: 'South Korean Won', shortName: 'Won' }
describeCurrency('KRW', 'ko-KR'); // { symbol: '₩', symbolPosition: 'prefix', name: '대한민국 원' }
```

---

## 공개 표면

### `MoneyBag`

하나의 통화로 표시된 금액. **불변**이며 모든 연산은 새 인스턴스를 돌려준다.

#### 생성

| | 설명 |
| --- | --- |
| `MoneyBag.of(amount, code)` | 타입이 확인된 통화 코드로 만든다 |
| `MoneyBag.zero(code)` | 해당 통화의 0 |
| `MoneyBag.deserialize({ amount, currencyCode })` | 타입 시스템 밖에서 들어온 값으로 만든다. 통화 코드를 검증한다 |

`amount`는 `Decimal`, 문자열, 숫자를 받는다. **숫자는 유효숫자 15자리까지만 받는다.** 그보다 많은 자리가 필요한 숫자는 이 라이브러리에 닿기 전에 이미 부동소수점 오차를 안고 있으므로 거부하고 문자열로 넘기라고 알린다.

```ts
MoneyBag.of(19.99, 'USD'); // 정확히 19.99
MoneyBag.of(0.1 + 0.2, 'USD'); // InvalidAmountException
MoneyBag.of('0.30', 'USD'); // 정확히 0.30
```

#### 읽기

| | 타입 | 설명 |
| --- | --- | --- |
| `amount` | `Decimal` | 금액. 지금까지의 모든 자리를 그대로 갖고 있다 |
| `currency` | `Currency` | 통화 메타데이터 |
| `currencyCode` | `CurrencyCode` | 통화 코드 |
| `scale` | `number` | 금액이 현재 쓰고 있는 소수 자릿수. 통화가 표현할 수 있는 자릿수보다 클 수 있다 |

#### 산술

`plus` `minus` `times` `dividedBy` `negated`

`plus`와 `minus`는 같은 통화끼리만 가능하다. 다르면 `CurrencyMismatchException`. `times`와 `dividedBy`는 통화가 아닌 배수를 받는다(수량, 비율, 세율 등).

**어떤 산술도 반올림하지 않는다.** `10000 KRW`를 3으로 나누면 34자리를 그대로 들고 있는다.

#### 비교

`equals` `compareTo` `isGreaterThan` `isGreaterThanOrEqual` `isLessThan` `isLessThanOrEqual` `isZero` `isPositive` `isNegative`

`equals`는 통화가 다르면 예외 없이 `false`다. 나머지 비교는 통화가 다르면 `CurrencyMismatchException`을 던진다. 순서를 묻는 질문은 통화가 다르면 답 자체가 없기 때문이다.

#### 확정

| | 설명 |
| --- | --- |
| `round(mode)` | 통화가 정의한 자릿수로 줄인다 |
| `roundTo(scale, mode)` | 지정한 자릿수로 줄인다 |

**모드에 기본값이 없다.** 어떻게 깎을지는 사업이 정하는 문제이므로 항상 명시해야 한다.

```ts
MoneyBag.of('2.345', 'USD').round(Decimal.ROUND_HALF_UP); // 2.35
MoneyBag.of('2.345', 'USD').round(Decimal.ROUND_HALF_EVEN); // 2.34
```

#### 내보내기

| | 설명 |
| --- | --- |
| `serialize(round?)` | `{ amount, currencyCode }`. 지수 표기는 절대 쓰지 않는다 |
| `toString()` | 금액과 코드. 로그와 메시지용이며 사람에게 보이는 화면은 포맷터를 거친다 |
| `copy()` | 동일한 값의 새 인스턴스 |

`serialize()`는 **기본적으로 무손실**이다. 모드를 주면 그때만 통화 자릿수로 고정되며, 결과는 정확히 그 자릿수를 채운다.

```ts
MoneyBag.of(10, 'USD').serialize(); //                        { amount: '10',      ... }
MoneyBag.of(10, 'USD').serialize(Decimal.ROUND_HALF_UP); //   { amount: '10.00',   ... }
MoneyBag.of(1000, 'KRW').serialize(Decimal.ROUND_HALF_UP); // { amount: '1000',    ... }
```

저장은 이 라이브러리의 책임이 아니다. 정제된 문자열까지만 주고, 어떤 컬럼에 어떤 정밀도로 담을지는 호출자가 정한다.

### `Currency` · `CurrencyCode`

| | 설명 |
| --- | --- |
| `CurrencyCode` | 이 라이브러리가 아는 통화 코드의 유니온 타입. 오타는 컴파일 단계에서 실패한다 |
| `getCurrency(code)` | 그 통화의 메타데이터 |
| `listCurrencies()` | 전체 통화를 코드 순으로 |
| `isCurrencyCode(value)` | 문자열이 알려진 코드인지 좁힌다 |
| `parseCurrencyCode(value)` | 좁히거나 `UnsupportedCurrencyException`을 던진다 |

`Currency`가 담는 것:

| 필드 | 예 (KRW) | 설명 |
| --- | --- | --- |
| `code` | `'KRW'` | 통화 코드 |
| `numericCode` | `'410'` | 선행 0을 유지하는 세 자리 문자열. 카드 결제 규격처럼 통화를 숫자로 식별하는 곳에서 쓴다 |
| `minorUnits` | `0` | 보조단위 자릿수 |
| `name` | `'South Korean Won'` | 영문 정식 이름 |
| `shortName` | `'Won'` | 단위 자체의 영문 이름. 나라 이름이 붙지 않는다 |

```ts
getCurrency('USD').minorUnits; // 2 — 소수 둘째 자리까지
getCurrency('KRW').minorUnits; // 0 — 소수점이 없다
getCurrency('BHD').minorUnits; // 3
```

`minorUnits`는 ISO 4217이 정의한 값이며 **항상 숫자다** — 보조단위를 정의하지 않는 코드는 애초에 테이블에 없다. [통화 데이터](#통화-데이터)를 참고한다.

두 이름은 출처가 다르다. `shortName`은 표준이 그 단위를 부르는 이름이고, `name`은 로케일 데이터가 주는 영문 정식 이름이다. 로케일 데이터가 닿지 않는 소수의 코드에서는 둘이 같아진다.

이름은 **영문으로 고정**되어 있다. 다른 언어가 필요하면 [`describeCurrency`](#describecurrency)가 로케일에 맞는 이름을 준다.

### `describeCurrency`

로케일이 그 통화를 어떻게 쓰는지 알려준다. 기호, 기호의 위치, 그리고 그 로케일에서의 이름.

```ts
describeCurrency(code, locale, options?): CurrencyDisplay
```

| 필드 | 설명 |
| --- | --- |
| `symbol` | 그 로케일이 쓰는 기호 |
| `symbolPosition` | `'prefix'` 또는 `'suffix'` |
| `name` | 그 로케일에서의 이름 |

```ts
describeCurrency('KRW', 'ko-KR'); // { symbol: '₩', symbolPosition: 'prefix', name: '대한민국 원' }
describeCurrency('KRW', 'en');    // { symbol: '₩', symbolPosition: 'prefix', name: 'South Korean Won' }
```

**세 필드 모두 통화만으로 정해지지 않는다.** 같은 통화가 로케일에 따라 기호를 앞에 두기도 하고 뒤에 두기도 한다.

```ts
describeCurrency('EUR', 'en-US').symbolPosition; // 'prefix'  →  €1,234.50
describeCurrency('EUR', 'de-DE').symbolPosition; // 'suffix'  →  1.234,50 €
```

그래서 이 값들은 통화 메타데이터(`Currency`)에 들어 있지 않다. 통화에 매달아두면 어느 로케일의 것인지 알 수 없는 값이 된다.

`narrowSymbol` 옵션은 로케일이 헷갈리는 기호를 구분하려고 붙인 수식을 떼어낸다. 통화가 하나로 정해져 있는 화면에서만 안전하다.

```ts
describeCurrency('CAD', 'en-US').symbol;                        // 'CA$'
describeCurrency('CAD', 'en-US', { narrowSymbol: true }).symbol; // '$'
```

### `allocate(total, weights)`

금액을 요청한 비율로 쪼개되 **총합을 정확히 보존한다.**

통화의 최소 단위는 대개 나누어떨어지지 않고, 각 조각을 따로 반올림하면 돈이 사라지거나 생겨난다. 이 함수는 먼저 절사한 뒤 남은 최소 단위를 부족분이 큰 순서로 하나씩 나눠준다. 부족분이 같으면 인자 순서를 지키므로 같은 요청은 항상 같은 결과를 낸다.

```ts
allocate(MoneyBag.of(10000, 'KRW'), [1, 1, 1]);
// 3334, 3333, 3333  — 합계 10000

allocate(MoneyBag.of('100', 'USD'), [1, 1, 1]);
// 33.34, 33.33, 33.33  — 합계 100
```

반올림 모드를 받지 않는다. 총합 보존이 알고리즘에 내장되어 있어 모드가 개입할 자리가 없다.

음수 총액(환불 등)도 같은 방식으로 쪼개진다. 가중치가 0인 항목은 아무것도 받지 않는다.

거부하는 경우:

- 가중치가 하나도 없거나, 전부 0이거나, 음수가 섞였을 때 → `InvalidAllocationException`
- 총액이 통화가 표현할 수 있는 자릿수보다 정밀할 때 → `InvalidAmountException`. 아무도 받을 수 없는 나머지가 생기므로, 호출자가 먼저 명시적으로 확정해야 한다

### `formatMoney` · `formatMoneyToParts`

로케일이 그 통화를 쓰는 방식대로 금액을 쓴다.

```ts
formatMoney(money, locale, options?): string
formatMoneyToParts(money, locale, options?): Intl.NumberFormatPart[]
```

`locale`은 **필수**다. 생략하면 실행 환경의 기본 로케일이 조용히 끼어드는데, 서버에서 그것은 결과를 예측할 수 없게 만든다.

`options`는 표시 방식(`Intl.NumberFormatOptions`)에서 금액 자신이 이미 정하는 부분을 뺀 것이다. 통화를 바꿔치기할 수 없다.

기호 대신 이름으로 쓰려면 표시 방식을 넘긴다.

```ts
formatMoney(money, 'en-US', { currencyDisplay: 'name' }); // "1,234 South Korean won"
```

포맷터 인스턴스는 로케일·옵션·통화 조합별로 캐시된다. 생성 비용이 사용 비용보다 훨씬 크고, 한 프로세스가 쓰는 조합은 몇 개로 정해져 있기 때문이다.

**표시 자릿수는 통화가 정의한 자릿수와 다를 수 있다.** [통화 데이터](#통화-데이터)를 참고한다.

### 예외

모두 표준 `Error`를 상속한다. 프레임워크에 묶이지 않기 위해서다. HTTP 상태로의 변환은 이 라이브러리를 쓰는 쪽이 한다.

| | 언제 |
| --- | --- |
| `UnsupportedCurrencyException` | 알지 못하는 통화 코드 |
| `CurrencyMismatchException` | 서로 다른 통화를 결합하려 할 때 |
| `InvalidAmountException` | 금액이 될 수 없는 값, 또는 통화가 담을 수 없을 만큼 정밀한 값 |
| `InvalidAllocationException` | 배분을 설명할 수 없는 가중치 |

---

## 지켜지는 규칙

1. **암묵적 반올림이 없다.** 산술은 자리를 버리지 않는다. 확정은 `round`, `roundTo`, 그리고 모드를 넘긴 `serialize`에서만 일어난다.
2. **반올림 모드에 기본값이 없다.** 기본값을 두는 순간 라이브러리가 사업의 결정을 대신하게 된다.
3. **통화가 다르면 결합하지 않는다.** 조용한 환산은 없다.
4. **전역 상태를 건드리지 않는다.** 내부 계산은 격리된 `Decimal` 생성자를 쓴다. 소비자의 `Decimal` 설정은 그대로 남는다.
5. **지수 표기를 내보내지 않는다.** 직렬화 결과는 언제나 평범한 십진 문자열이다.

---

## 통화 데이터

ISO 4217이 발행하는 목록에서 생성한다. **165개 통화**를 담는다.

### 두 가지 자릿수

계산에 쓰는 자릿수와 표시에 쓰는 자릿수는 **서로 다른 질문이고 답도 다르다.**

- **ISO 4217** — 법적·회계상 보조단위. 이 라이브러리의 `minorUnits`가 이 값이다. 계산과 저장의 기준.
- **CLDR** — 사람들이 실제로 쓰는 자릿수. 실행 환경의 `Intl`이 이 값을 쓴다. 표시의 기준.

실제로 어긋나는 통화들:

| 통화 | ISO 4217 | CLDR |
| --- | --- | --- |
| 헝가리 포린트 | 2 | 0 |
| 이라크 디나르 | 3 | 0 |
| 콜롬비아 페소 | 2 | 0 |
| 말라가시 아리아리 | 2 | 0 |

헝가리에서 필레르는 쓰이지 않지만 표준에는 살아 있다. 계산은 표준을 따르고 표시는 관행을 따르는 것이 옳다.

### 빠져 있는 코드

보조단위를 정의하지 않는 13개 코드는 테이블에 없다. 귀금속(금·은·백금·팔라듐), 회계 단위, 채권시장 단위, 그리고 테스트용과 "통화 없음" 코드다.

커머스에서 쓰지 않는 코드이며, 남겨두면 "이 통화의 자릿수로 반올림한다"가 답이 없는 연산이 된다. 실행 환경의 `Intl`은 이 코드들에 2를 지어내므로, 표시만 믿고 계산하면 값이 조용히 잘려나간다.

---

## 런북

### 통화 목록 갱신

ISO가 새 목록을 발행했을 때만 한다. 자동 갱신은 두지 않는다 — 원격의 변경이 조용히 배포에 섞여 들어가는 경로이기 때문이다.

이 디렉터리에서 실행한다.

```
node currency/currency-table.codegen.mjs
```

생성기는 결과물을 덮어쓰기 전에 확인한다. 발행일이 없거나, 통화가 너무 적게 나오거나, 같은 코드에 상충하는 정의가 있으면 멈춘다. 이상한 테이블을 조용히 뱉는 것이 가장 나쁜 실패이기 때문이다.

생성된 파일은 손으로 고치지 않는다. 커밋에는 생성기의 출력과 발행일 변경이 함께 들어가야 한다.

### 별도 저장소로 분리

1. 이 디렉터리를 통째로 새 저장소의 `src/`로 옮긴다. 프로젝트 내부를 참조하는 코드가 없으므로 수정할 파일은 없다.
2. `package.json`에 `decimal.js`를 **`peerDependencies`로** 선언한다. `dependencies`로 두면 소비자 트리에 사본이 둘 생겨 `instanceof`가 깨진다.
3. `tsconfig.json`의 `types`는 비워도 된다. 이 라이브러리는 실행 환경 API를 쓰지 않는다.
4. 진입점을 `index.ts`로 지정한다.
5. 소비자 쪽에서는 import 경로만 패키지 이름으로 바꾼다. 진입점이 그대로이므로 그 외에 바뀌는 것은 없다.

### 문제 해결

**`instanceof Decimal`이 `false`인데 값은 같다**
`decimal.js` 사본이 둘이다. CommonJS 빌드와 ESM 빌드가 섞였거나, peer dependency가 아니라 일반 의존성으로 선언되어 있다.

**포맷 결과 비교가 실패한다**
`Intl`은 통화 표기와 숫자 사이에 일반 공백이 아니라 줄바꿈 없는 공백(U+00A0)을 넣는다. 스냅샷이나 문자열 동치 비교를 쓸 때 반드시 걸린다.

**금액을 넘겼는데 거부당한다**
숫자로 넘긴 값이 유효숫자 15자리를 넘었다. 계산 결과를 숫자로 만들어 넘기는 대신 문자열로 넘기거나, 애초에 이 라이브러리 안에서 계산한다.

---

## 알려진 제약

- **테스트가 없다.** 동작은 검증 스크립트로 확인했으나 저장소에 남는 테스트로 옮기지 않았다. 분리 시점에 가장 먼저 채워야 할 자리다.
- **CommonJS만 상정한다.** 듀얼 패키지로 낼 계획이라면 빌드 구성이 추가로 필요하다.
- **표시 이름을 담지 않는다.** 통화의 이름은 로케일마다 다르므로 `Intl`이 더 잘 준다.
