import axios from 'axios';

export default class Github {
    private baseURL: string;
    private repoList: string[];
    private token: string;

    constructor(githubToken: string) {
        this.baseURL = ' https://api.github.com';
        this.repoList = [
            'mossland_disclosure_web', 
            'Hackathon',
            'MosslandDeveloperSupportProgram',
            'mossverse',
            'art_resource',
            'Disclosure-and-Materials',
            'The-Story-of-CyberTHUG',
            'MossCoin',
            'Projects',
            'MossDAO',
            'Brand-Identity',
        ];
        this.token = githubToken;
    }

    public async getWeeklyCodeCount(){
        let ret = await this.getStatistics('code_frequency');
        let codeCount = new Map();
        for(const info of ret){
            let key = info[0];
            let add = info[1];
            let del = info[2];
            if (codeCount.has(key)){
                let count = codeCount.get(key);
                count.add += add;
                count.del += del;
                codeCount.set(key, count);
            }else {
                codeCount.set(key, {add : add, del : del});
            }
        }

        let retValue = Array.from(codeCount).map(([name, value]) => ({date : name, add : value.add, del : value.del}));

        retValue.sort(function(a, b) {
            return a.date - b.date;
        });

        return retValue;     
    }

    public async getWeeklyCommitCount(){
        let ret: any = await this.getStatistics('participation');        

        let retValue: { all: any[], owner: any[] } = {all: [], owner: []};
        retValue.all = new Array(52).fill(0);
        retValue.owner = new Array(52).fill(0);

        for(const e of ret){
            e.all.map(function(item: any, index: number) {
                retValue.all[index] += item;
            });

            e.owner.map(function(item: any, index: number) {
                retValue.owner[index] += item;
            });
        }

        return retValue;
    }

    public async getStatistics(command: string){
        let resList: any[] = [];
        for(const repo of this.repoList){
            let returnCode = 0;
            let tryCount = 0;
            do{
                const url = `/repos/mossland/${repo}/stats/${command}`;
                const config = {
                    baseURL : this.baseURL,
                    url,
                    method: "get",
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'X-GitHub-Api-Version' : '2022-11-28',
                        'Accept' : 'application/vnd.github.text+json',
                    },
                    timeout : 2000,
                }
                try{
                    let res = await axios(config);
                    returnCode = res.status;
                    //console.log(repo + ' res.status : ' + res.status);
                    if (res.status === 200){  
                        resList = resList.concat(res.data);                        
                    } else {
                        tryCount++;
                        if (tryCount >= 5)
                            returnCode = 200;
                    }
                } catch (err){
                    console.log(err)
                    returnCode = 0;
                }
            }while(returnCode !== 200);
        }

        return resList;
    }
}
