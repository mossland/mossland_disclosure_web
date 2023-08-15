# Mossland Disclosure System

In the first half of 2023, Mossland introduced the Disclosure System to provide greater transparency and a fairer opportunity for project participation to Mosscoin holders. This system offers comprehensive information related to Mosscoin, including real-time circulating supply, future distribution plans, and a list of wallets managed by the foundation. Additionally, it furnishes real-time information about Mossland's open-source development progress and voting status within its decentralized framework, thus aiding Mosscoin holders in assessing the project's progression.

The Mossland Disclosure System (https://disclosure.moss.land) is an open-source project.

## Development Roadmap

- 2023-01-09: **[Completed]** Mossland Disclosure Website Launch: Open-source Node.js backend for market data and document access
  - Purpose: Provide comprehensive information about Mosscoin distribution plans and disclosures
  - Content: Backend source code based on Node.js, offering information through HTTP REST APIs
    - Distribution information disclosure: Market capitalization, current circulating supply, distribution plans, foundation wallet lists, planned changes in circulation, etc.
    - Information disclosure: Disclosure documents, project-related documents
    
- 2023-05-30: **[Completed]** Mossland Disclosure Website Update: Real-time trading and market data, along with open-source community statistics
  - Purpose: Provide real-time Mosscoin transaction data, market data, and Mossland project activity information to assist Mosscoin holders in evaluating the project
  - Content: Real-time Mosscoin transaction information, real-time market data, open-source community activity information and statistics
    - Real-time Mosscoin transaction information: Contract source code, Mosscoin holder count, recent transaction count, real-time transfer records
    - Real-time Mosscoin market information: Mosscoin trading volume, circulating supply, price indicators, real-time order/execution history, etc.
    - Mossland open-source activity information: Github Code Frequency, Github Code Commits real-time information
    - Mossland DAO activity information: Total agenda count, cumulative voting count, recent agenda status, etc.

- 2024: Real-time updates of Mossland's decentralized governance framework information and statistics

## Source Code Directory Overview

### [mossland_disclosure_api](/mossland_disclosure_api)
Backend source code based on .NET that provides the following information through HTTP REST APIs:
- Market capitalization (Mossland, CoinMarketCap, CoinGecko)
- Circulating supply (Mossland, CoinMarketCap, CoinGecko)
- Total issuance limit (Mossland)
- Circulating supply change plans
- Disclosures, public documents

### [mossland_disclosure_api2](/mossland_disclosure_api2)
Backend source code based on Node.js that provides the following information through HTTP REST APIs:
- Market capitalization (Mossland, CoinMarketCap, CoinGecko)
- Circulating supply (Mossland, CoinMarketCap, CoinGecko)
- Total issuance limit (Mossland)
- Circulating supply change plans
- Disclosures, public documents

### [nginx](/nginx)
Provides nginx.conf needed for operating backend servers based on .NET

### [web](/web)
Source code for the website's frontend.




# 모스랜드 공시 시스템

모스랜드는 2023년 상반기에 모스랜드는 모스코인 홀더에게 보다 높은 투명성과 공정한 프로젝트 참여 가능성을 제공하기 위해서 공시 시스템을 출시했습니다. 이 시스템은 모스코인의 실시간 유통량, 향후 유통 계획, 재단이 관리하는 지갑 리스트 등과 같은 모스코인과 관련된 종합적인 정보를 제공합니다. 또한, 모스랜드의 오픈소스 개발 진행 상황과 분산화 프레임워크에서 진행되는 투표 현황과 같은 실시간 정보를 제공하여 모스코인 홀더들이 모스랜드 프로젝트의 진행 상황을 평가하는 데 큰 도움을 주고 있습니다.

모스랜드 공시 시스템(https://disclosure.moss.land) 오픈소스 프로젝트입니다.

## 개발 로드맵

- 2023-01-09: **[개발 완료]** Mossland 공시 웹사이트: 시장 데이터 및 문서용 오픈 소스 Node.js 백엔드 공개
  - 목적: 모스코인 유통 계획과 공시 자료를 종합적으로 제공
  - 내용: Node.js를 기반으로 한 백엔드 소스 코드로, HTTP REST API를 통해 정보를 제공
    - 유통 정보 공개: 시가총액(Market Cap), 현재 유통량(Circulating Supply), 유통 계획, 재단 지갑 리스트, 유통량 변경 계획 등
    - 정보 공개: 공시 문서, 프로젝트 관련 문서
    
- 2023-05-30: **[개발 완료]** Mossland 공시 웹사이트 업데이트: 실시간 거래 및 시장 데이터, 그리고 오픈 소스 커뮤니티 통계
  - 목적: 모스코인 활성화와 모스랜드 프로젝트의 활동 정보를 실시간으로 제공하여 모스코인 홀더에게 프로젝트 평가에 도움을 주는 것
  - 내용: 모스코인 실시간 거래 정보, 실시간 시장 데이터, 오픈 소스 커뮤니티 활동 정보와 통계 제공
    - 실시간 모스코인 트랜잭션 정보: 컨트랙트 소스 코드, 모스코인 홀더 수, 최근 트랜잭션 개수, 실시간 전송 기록
    - 실시간 모스코인 마켓 정보: 모스코인 거래량, 유통량, 가격 지표, 실시간 호가/체결 이력 등
    - 모스랜드 오픈소스 활동 정보: Github Code Frequency, Github Code Commits 실시간 정보
    - 모스랜드 DAO 활동 정보: 전체 안건 수, 누적 투표 수, 최근 안건 현황 등
   
- 2023-08-15: **[개발 완료]** Mossland 공시 웹사이트 2차 업데이트: 모스코인 스왑 실시간 상태
  - 목적: 모스코인 거래수준 향상을 위해 개발된 Wrapped MOC(WMOC)과 모스코인 스왑 시스템 (https://swap.moss.land)의 실시간 정보를 제공
  - 내용:
    - Wrapped MOC(WMOC) 컨트랙트 코드, 주소, 거래 정보 제공
    - 모스코인 스왑 시스템의 실시간 상태 정보 제공: WMOC/MOC 락업 수량과 지갑 주소 등

- 2024년: 모스랜드 분산 거버넌스 프레임워크의 실시간 정보 및 통계 업데이트

## 소스코드 디렉토리 소개

### [mossland_disclosure_api](/mossland_disclosure_api)
.net 기반의 backend 소스코드로 HTTP REST API로 아래 정보를 제공합니다.
- 시가총액 (모스랜드, 코인마켓캡, 코인게코)
- 유통량 (모스랜드, 코인마켓캡, 코인게코)
- 총 발행한도 (모스랜드)
- 유통량 변동 계획
- 공시, 공개문서

### [mossland_disclosure_api2](/mossland_disclosure_api2)
node 기반의 backend 소스코드로 HTTP REST API로 아래 정보를 제공합니다.
- 시가총액 (모스랜드, 코인마켓캡, 코인게코)
- 유통량 (모스랜드, 코인마켓캡, 코인게코)
- 총 발행한도 (모스랜드)
- 유통량 변동 계획
- 공시, 공개문서

### [nginx](/nginx)
.net 기반의 backend 서버 운영시 필요한 nginx.conf 제공

### [web](/web)
홈페이지 소스코드입니다.
