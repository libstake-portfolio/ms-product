# 저장 모델 선언

> 저장 모델 파일 하나가 어떤 구성을 갖고, 필드 유형마다 어떤 형태로 선언하는지.
>
> 이 형태를 택한 근거는 [영속성 매핑](../architectures/persistence-mapping.md)이 소유한다.

---

## 이름 규칙

| 대상 | 규칙 |
| --- | --- |
| 파일 | 케밥 표기 + 저장 모델임을 나타내는 접미사 |
| 클래스 | 파스칼 표기 + 파일과 같은 접미사 |
| 생성 인자 타입 | 클래스 이름 + 생성 인자를 나타내는 접미사 |
| 테이블 | 스네이크 표기, 복수형 |
| 컬럼 | 스네이크 표기. 전역 이름 전략에 맡기지 않고 항상 명시한다 |
| 외래 키 속성 | 대상 이름 + 식별자 접미사 (카멜 표기) |
| 참조 대상 속성 | 대상 이름 그대로. 단수 관계는 단수, 컬렉션은 복수 |
| 기본 키 제약 | `pk_` + 테이블 |
| 외래 키 제약 | `fk_` + 테이블 + 컬럼 |
| 유일 제약 | `uq_` + 테이블 + 컬럼들 |
| 인덱스 | `ix_` + 테이블 + 컬럼들 |

컬럼 이름을 항상 명시하는 이유는, 속성 이름을 바꿔도 컬럼이 따라 바뀌지 않게 하기 위해서다. 속성 이름은 코드의 사정이고 컬럼 이름은 스키마의 사정이다.

**테이블·컬럼·제약·인덱스 이름은 예외 없이 명시한다.** 저장 도구가 지어 주는 이름은 규칙을 알 수 없는 문자열이거나 해시라서, 장애 상황에서 어떤 제약이 걸렸는지 읽을 수 없고 마이그레이션에서 지목할 수도 없다. 속성 이름을 바꿨을 때 제약 이름이 조용히 따라 바뀌는 것도 막는다.

## 파일 구성 순서

1. 생성 인자 타입 — **원시 컬럼만** 담는다. 참조 대상 속성은 넣지 않는다.
2. 테이블 선언과 클래스
3. 기본 키
4. 소유 관계의 참조 쌍 — 이 행이 속한 상위 대상
5. 자체 속성 컬럼
6. 다른 대상에 대한 참조 쌍
7. 자식 컬렉션
8. 생성자

참조 쌍은 언제나 **참조 대상 속성 → 외래 키 속성** 순서로 붙여 쓴다.

## 필드 유형별 선언 형태

### 기본 키

```ts
@PrimaryColumn('uuid', { name: 'id', primaryKeyConstraintName: 'pk_<table_name>' })
public id: string;
```

### 일반 컬럼

```ts
@Column({ name: '<column_name>', type: '<type>', nullable: false })
public <field>: string;
```

기본값이 필요하면 `default`를 함께 준다. **선언한 타입이 설정된 데이터베이스 드라이버가 지원하는 타입인지 반드시 확인한다.** 다른 드라이버의 타입 이름을 쓰면 연결 전에 실패한다.

조회 조건으로 쓰이는 컬럼에는 인덱스를 붙인다.

```ts
@Index('ix_<table_name>_<column_name>')
@Column({ name: '<column_name>', type: '<type>', nullable: false })
public <field>: string;
```

### 참조 (참조 대상 + 외래 키)

**참조 대상 속성이 먼저 오고, 외래 키 속성이 뒤따른다.** 둘 사이에 빈 줄을 두지 않아 하나의 쌍으로 읽히게 한다.

```ts
@JoinColumn({ name: '<ref>_id', foreignKeyConstraintName: 'fk_<table_name>_<ref>_id' })
@ManyToOne(() => <Ref>OrmEntity, <ref> => <ref>.<inverse>, { nullable: false, onDelete: '<정책>', onUpdate: '<정책>' })
public <ref>?: <Ref>OrmEntity;
@Index('ix_<table_name>_<ref>_id')
@Column({ name: '<ref>_id' })
public <ref>Id: string;
```

- 조인 정보는 **참조 대상 속성**에 붙인다. 외래 키 속성에 붙이면 아무 효과가 없고, 컬럼 이름과 제약 이름이 조용히 기본값으로 정해진다.
- 외래 키 속성은 **필수**다. 조회하면 항상 채워진다.
- 참조 대상 속성은 **반드시 선택적**이다. 함께 가져올지는 조회가 정한다.
- 속성이 `null`을 허용하면 컬럼 선언에도 `nullable`을 함께 준다. 둘이 어긋나면 타입은 `null`을 허용하는데 스키마가 거부한다.
- **외래 키 컬럼에는 인덱스를 붙인다.** 자동으로 생기지 않으므로, 참조 대상을 지우거나 역방향으로 조회할 때마다 전체 탐색이 일어난다.
- 반대편에 컬렉션이 없으면 역방향 인자를 생략한다.

### 자식 컬렉션

```ts
@OneToMany(() => <Child>OrmEntity, <child> => <child>.<inverse>)
public <children>?: <Child>OrmEntity[];
```

컬렉션도 **반드시 선택적**이다. 생성 인자 타입에는 넣지 않는다.

### 유일 제약

클래스 선언 위에 붙이고, 이름을 먼저 준 뒤 컬럼 이름이 아니라 **속성 이름**으로 대상을 지정한다.

```ts
@Unique('uq_<table_name>_<ref>_id_<column_name>', ['<ref>Id', '<field>'])
```

여러 컬럼에 걸친 유일 제약은 앞쪽 컬럼에 대한 인덱스 역할도 함께 한다. 같은 컬럼으로 시작하는 인덱스를 따로 두면 중복이다.

### 생성자

```ts
// Hydrating a row instantiates without arguments, so the props are optional.
public constructor(props?: <Name>OrmEntityProps) {
    if (!props) return;
    this.id = props.id;
    this.<ref>Id = props.<ref>Id;
    this.<field> = props.<field>;
}
```

인자를 선택적으로 두는 이유는 조회 결과를 되살릴 때 저장 도구가 인자 없이 인스턴스를 만들기 때문이다. 필드는 하나씩 명시적으로 대입한다.

## 인덱스 붙이는 기준

| 대상 | 붙이는가 |
| --- | --- |
| 외래 키 컬럼 | 붙인다. 자동으로 생기지 않는다 |
| 이름·식별용 문자열처럼 조회 조건이 되는 컬럼 | 붙인다 |
| 여러 컬럼 유일 제약의 앞쪽 컬럼 | 붙이지 않는다. 유일 제약이 이미 그 역할을 한다 |
| 본문·설명처럼 조건으로 쓰이지 않는 컬럼 | 붙이지 않는다 |

유일해야 하는 값과 자주 찾는 값은 다르다. 중복을 막을 의도가 없다면 유일 인덱스를 쓰지 않는다.

## 삭제·갱신 정책 고르기

| 관계 | 정책 |
| --- | --- |
| 같은 애그리거트 안의 자식 → 루트 | 함께 삭제 |
| 다른 애그리거트에 대한 필수 참조 | 삭제 거부 |
| 다른 애그리거트에 대한 선택적 참조 | 참조를 비움 |

## 전체 형태

```ts
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, Unique } from 'typeorm';

import { <Child>OrmEntity } from './<child>.orm-entity';
import { <Ref>OrmEntity } from './<ref>.orm-entity';

export interface <Name>OrmEntityProps {
    id: string;
    <ref>Id: string;
    <field>: string;
}

@Entity({ name: '<table_name>' })
@Unique('uq_<table_name>_<ref>_id_<column_name>', ['<ref>Id', '<field>'])
export class <Name>OrmEntity {
    @PrimaryColumn('uuid', { name: 'id', primaryKeyConstraintName: 'pk_<table_name>' })
    public id: string;

    @JoinColumn({ name: '<ref>_id', foreignKeyConstraintName: 'fk_<table_name>_<ref>_id' })
    @ManyToOne(() => <Ref>OrmEntity, <ref> => <ref>.<inverse>, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    public <ref>?: <Ref>OrmEntity;
    @Index('ix_<table_name>_<ref>_id')
    @Column({ name: '<ref>_id' })
    public <ref>Id: string;

    @Index('ix_<table_name>_<column_name>')
    @Column({ name: '<column_name>', type: 'text', nullable: false })
    public <field>: string;

    @OneToMany(() => <Child>OrmEntity, <child> => <child>.<inverse>)
    public <children>?: <Child>OrmEntity[];

    // Hydrating a row instantiates without arguments, so the props are optional.
    public constructor(props?: <Name>OrmEntityProps) {
        if (!props) return;
        this.id = props.id;
        this.<ref>Id = props.<ref>Id;
        this.<field> = props.<field>;
    }
}
```

## 하지 말 것

- **생성 인자 타입에 참조 대상이나 컬렉션을 넣기** — 참조 대상은 조회만 채운다. 코드가 객체 그래프를 조립하는 입구를 만들지 않는다.
- **참조 대상 속성을 필수로 선언하기** — 예외를 두지 않는다. 항상 로드된다는 가정은 반드시 틀린 경로를 만든다.
- **모듈 경계를 넘는 역방향 관계 선언** — 참조당하는 쪽이 참조하는 쪽을 알게 되어 모듈 의존이 순환한다. 경계를 넘는 참조는 한 방향으로만 둔다.
- **관계 선언에 연쇄 저장 옵션 켜기** — 자식 저장은 저장소가 직접 수행한다. 옵션을 켜면 무엇이 언제 저장되고 지워지는지가 코드에서 사라진다.
- **컬럼 이름 생략** — 속성 이름 변경이 스키마 변경으로 번진다.
- **제약·인덱스 이름을 저장 도구에 맡기기** — 읽을 수 없는 이름이 생겨 장애 대응과 마이그레이션에서 지목할 수 없다.
- **조인 정보를 외래 키 속성에 붙이기** — 효과가 없다. 컴파일도 통과하고 컬럼 이름이 기본값과 우연히 같으면 동작까지 해서, 어긋날 때까지 드러나지 않는다.

## 선언한 뒤 확인할 것

선언은 컴파일만으로 검증되지 않는다. 타입이 드라이버에서 지원되는지, 관계가 의도한 외래 키로 해석됐는지, 널 허용이 속성과 일치하는지, **모든 제약과 인덱스에 지어 둔 이름이 실제로 적용됐는지**는 메타데이터를 실제로 빌드해야 드러난다. 새 저장 모델을 추가하거나 관계를 바꾼 뒤에는 이 단계까지 확인한다.
