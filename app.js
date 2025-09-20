/***************
 * app.js
 * Wallet connect + staking UI logic
 ***************/

/************************************************************************
 * Configuration + constants (change only if needed)
 ************************************************************************/
const CONFIG = {
  NETWORK_NAME: "Polygon",
  CHAIN_ID: 137,
  RPC: "https://polygon-rpc.com/", // public RPC (you may replace)
  STAKING_CONTRACT_ADDRESS: "0x9fd473975cecd4587d78eb71f4498dde778c4b83",
  TOKEN_CONTRACT_ADDRESS:   "0x23b7a4c2ec9d742b5b1698149e812ca1e10d3e73",
  STAKING_ABI: [
    {"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"address","name":"_managementWallet","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Funded","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
    {"anonymous":false,"inputs":[],"name":"Paused","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"stakeIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"fee","type":"uint256"}],"name":"PrincipalWithdrawn","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":true,"internalType":"address","name":"referee","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ReferralPaid","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RescueTokens","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountNet","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"fee","type":"uint256"}],"name":"RewardClaimed","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"stakeIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"}],"name":"Staked","type":"event"},
    {"anonymous":false,"inputs":[],"name":"Unpaused","type":"event"},
    {"inputs":[],"name":"BPS_DENOM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"MAX_STAKE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"MIN_STAKE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"REFERRAL_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"STAKE_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"TOTAL_REWARD_MULTIPLIER","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"WITHDRAWAL_FEE_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"availableBalanceForOperations","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256[]","name":"indices","type":"uint256[]"}],"name":"claimStakingRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"fund","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getStake","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"claimed","type":"uint256"},{"internalType":"bool","name":"principalWithdrawn","type":"bool"},{"internalType":"uint256","name":"totalReward","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"isReferrerEligible","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"managementWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"pendingRewardForStake","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"refereeUsed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"refereesCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"refereesOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"referrerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"newWallet","type":"address"}],"name":"setManagementWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"stakeCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"referrer","type":"address"}],"name":"stakeTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakes","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"claimed","type":"uint256"},{"internalType":"bool","name":"principalWithdrawn","type":"bool"},{"internalType":"uint256","name":"totalReward","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"token","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"totalPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"totalRewardLiability","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256[]","name":"indices","type":"uint256[]"}],"name":"withdrawPrincipal","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"withdrawReferralRewards","outputs":[],"stateMutability":"pure","type":"function"}
  ],
  TOKEN_ABI: [
    {"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},
    {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"},
    {"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"type":"function"},
    {"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"type":"function"},
    {"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"type":"function"}
  ],
  TOKEN_DECIMALS: 18
};

/************************************************************************
 * Globals
 ************************************************************************/
let provider;           // ethers provider (Web3 provider)
let ethProvider;        // raw provider instance (walletconnect / injected)
let signer;
let userAddress = null;
let tokenContract;
let stakingContract;
let web3Modal;

const connectBtn = document.getElementById('connectBtn');
const addrShort = document.getElementById('addrShort');
const walletBalance = document.getElementById('walletBalance');
const stakeAmount = document.getElementById('stakeAmount');
const referrerInput = document.getElementById('referrer');
const stakeBtn = document.getElementById('stakeBtn');
const approveBtn = document.getElementById('approveBtn');
const stakeSpinner = document.getElementById('stakeSpinner');
const stakeList = document.getElementById('stakeList');
const logEl = document.getElementById('log');
const contractAddrShort = document.getElementById('contractAddrShort');
const tokenAddrShort = document.getElementById('tokenAddrShort');
const claimBtn = document.getElementById('claimBtn');
const withdrawBtn = document.getElementById('withdrawBtn');
const refreshBtn = document.getElementById('refreshBtn');
const totalPendingEl = document.getElementById('totalPending');
const managementWalletEl = document.getElementById('managementWallet');

/************************************************************************
 * Helpers
 ************************************************************************/
function writeLog(...args){
  const txt = args.map(a=> (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
  const time = new Date().toLocaleTimeString();
  logEl.textContent = `[${time}] ${txt}\n` + logEl.textContent;
}
function shortAddr(addr){ if(!addr) return '—'; return addr.slice(0,6)+'...'+addr.slice(-4); }
function weiToDecimals(n){ return Number(ethers.utils.formatUnits(n || 0, CONFIG.TOKEN_DECIMALS)); }
function decimalsToWei(n){ return ethers.utils.parseUnits(String(n || 0), CONFIG.TOKEN_DECIMALS); }
function safeEnableBtn(btn, cond){ if(!btn) return; btn.disabled = !cond; }

/************************************************************************
 * Init Web3Modal + WalletConnect provider
 ************************************************************************/
function initModal(){
  const providerOptions = {
    walletconnect: {
      package: window.WalletConnectProvider.default,
      options: {
        rpc: { [CONFIG.CHAIN_ID]: CONFIG.RPC },
        chainId: CONFIG.CHAIN_ID
      }
    }
  };

  web3Modal = new window.Web3Modal.default({
    cacheProvider: false,
    providerOptions,
    theme: "dark"
  });
}

/************************************************************************
 * Connect / disconnect
 ************************************************************************/
async function connectWallet(){
  try{
    const instance = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(instance, "any");
    signer = provider.getSigner();
    ethProvider = instance;

    const network = await provider.getNetwork();
    if(network.chainId !== CONFIG.CHAIN_ID){
      writeLog(`⚠️ Wrong network (connected ${network.chainId}). Please switch to ${CONFIG.NETWORK_NAME} (chainId ${CONFIG.CHAIN_ID}).`);
    }

    userAddress = await signer.getAddress();
    addrShort.textContent = shortAddr(userAddress);
    connectBtn.textContent = 'Connected';
    connectBtn.classList.add('ghost');

    // setup contracts (connected)
    tokenContract = new ethers.Contract(CONFIG.TOKEN_CONTRACT_ADDRESS, CONFIG.TOKEN_ABI, signer);
    stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT_ADDRESS, CONFIG.STAKING_ABI, signer);

    tokenAddrShort.textContent = shortAddr(CONFIG.TOKEN_CONTRACT_ADDRESS);
    contractAddrShort.textContent = shortAddr(CONFIG.STAKING_CONTRACT_ADDRESS);

    await refreshAll();

    if(instance.on){
      instance.on("accountsChanged", async (accounts) => {
        writeLog("Accounts changed", accounts);
        if(accounts.length === 0){ disconnect(); return; }
        userAddress = accounts[0];
        addrShort.textContent = shortAddr(userAddress);
        signer = provider.getSigner();
        tokenContract = tokenContract.connect(signer);
        stakingContract = stakingContract.connect(signer);
        await refreshAll();
      });
      instance.on("chainChanged", async (chainId) => {
        writeLog("Chain changed", chainId);
        await refreshAll();
      });
    }
  } catch(err){
    console.error(err);
    writeLog("Connection failed:", err.message || err);
  }
}

async function disconnect(){
  provider = null;
  signer = null;
  userAddress = null;
  addrShort.textContent = 'Not connected';
  connectBtn.textContent = 'Connect Wallet';
  connectBtn.classList.remove('ghost');
  stakeList.innerHTML = '';
  walletBalance.textContent = '0 NAVAA';
}

/************************************************************************
 * Data fetching + UI rendering
 ************************************************************************/
let liveInterval = null;
let perStakeState = {};

async function refreshAll(){
  if(!signer) return;
  safeEnableBtn(stakeBtn, true);
  safeEnableBtn(claimBtn, true);
  safeEnableBtn(withdrawBtn, true);

  try{
    const balRaw = await tokenContract.balanceOf(userAddress);
    walletBalance.textContent = `${weiToDecimals(balRaw).toLocaleString()} NAVAA`;

    const pendingRaw = await stakingContract.totalPendingRewards(userAddress);
    totalPendingEl.textContent = `Pending: ${weiToDecimals(pendingRaw).toFixed(6)}`;

    const countBN = await stakingContract.stakeCount(userAddress);
    const count = countBN.toNumber();
    writeLog(`Found ${count} stakes`);

    const items = [];
    for(let i=0;i<count;i++){
      const s = await stakingContract.getStake(userAddress, i);
      const stakeObj = {
        index: i,
        amount: s.amount,
        startTime: s.startTime.toNumber(),
        claimed: s.claimed,
        principalWithdrawn: s.principalWithdrawn,
        totalReward: s.totalReward
      };
      const pending = await stakingContract.pendingRewardForStake(userAddress, i);
      stakeObj.pending = pending;
      items.push(stakeObj);
      perStakeState[i] = { basePending: pending, baseTimestamp: Date.now() };
    }

    renderStakeList(items);

    if(liveInterval) clearInterval(liveInterval);
    liveInterval = setInterval(()=> updateLivePending(items), 1000);

  } catch(err){
    console.error(err);
    writeLog("Refresh failed:", err.message || err);
  }
}

function updateLivePending(items){
  items.forEach(item=>{
    const el = document.getElementById(`pending-${item.index}`);
    if(!el) return;
    const state = perStakeState[item.index];
    if(!state) return;
    const diffSec = Math.floor((Date.now() - state.baseTimestamp)/1000);
    try {
      const totalReward = ethers.BigNumber.from(item.totalReward);
      if(window.__STAKE_DURATION__ && !totalReward.isZero()){
        const perSec = totalReward.div(window.__STAKE_DURATION__ || 1);
        const delta = perSec.mul(ethers.BigNumber.from(diffSec));
        const approx = ethers.BigNumber.from(state.basePending).add(delta);
        el.textContent = formatWeiShort(approx);
      } else {
        el.textContent = formatWeiShort(state.basePending);
      }
    } catch(e){
      el.textContent = formatWeiShort(state.basePending);
    }
  });

  const t = Date.now();
  if(!window.__lastAuthoritativeRefresh__) window.__lastAuthoritativeRefresh__ = 0;
  if(t - window.__lastAuthoritativeRefresh__ > 12000){
    window.__lastAuthoritativeRefresh__ = t;
    if(signingReady()){
      (async ()=>{
        try{
          const cnt = (await stakingContract.stakeCount(userAddress)).toNumber();
          for(let i=0;i<cnt;i++){
            const pending = await stakingContract.pendingRewardForStake(userAddress, i);
            perStakeState[i].basePending = pending;
            perStakeState[i].baseTimestamp = Date.now();
            const el = document.getElementById(`pending-${i}`);
            if(el) el.textContent = formatWeiShort(pending);
          }
          const tbal = await stakingContract.totalPendingRewards(userAddress);
          totalPendingEl.textContent = `Pending: ${weiToDecimals(tbal).toFixed(6)}`;
        }catch(e){/* ignore */ }
      })();
    }
  }
}

function formatWeiShort(bn){
  try{ return Number(ethers.utils.formatUnits(bn, CONFIG.TOKEN_DECIMALS)).toFixed(6); }
  catch(e){ return "0.000000" }
}

function renderStakeList(items){
  stakeList.innerHTML = '';
  const now = Math.floor(Date.now()/1000);

  (async ()=>{
    try{
      if(!window.__STAKE_DURATION__){
        const sd = await stakingContract.STAKE_DURATION();
        window.__STAKE_DURATION__ = sd.toNumber();
      }
    }catch(e){}
  })();

  items.forEach(it=>{
    const matured = (now >= it.startTime + (window.__STAKE_DURATION__ || 0));
    const claimed = Number(ethers.utils.formatUnits(it.claimed || 0, CONFIG.TOKEN_DECIMALS));
    const totalReward = Number(ethers.utils.formatUnits(it.totalReward || 0, CONFIG.TOKEN_DECIMALS));
    const amount = Number(ethers.utils.formatUnits(it.amount || 0, CONFIG.TOKEN_DECIMALS));
    const pending = formatWeiShort(it.pending || 0);

    const node = document.createElement('div');
    node.className = 'stake-item';
    node.innerHTML = `
      <div style="width:28px">
        <input class="checkbox" type="checkbox" id="chk-${it.index}" data-index="${it.index}">
      </div>
      <div class="stake-left">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:700">#${it.index} — ${amount.toLocaleString()} NAVAA</div>
          <div class="tiny-muted">${matured ? '<span class="green">Matured</span>' : '<span class="badge">Lock</span>'}</div>
        </div>
        <div class="stake-meta" style="margin-top:8px;">
          <div class="tiny-muted">Start: ${new Date(it.startTime*1000).toLocaleString()}</div>
          <div class="tiny-muted">Claimed: ${claimed.toFixed(6)}</div>
          <div class="tiny-muted">TotalReward: ${totalReward.toFixed(6)}</div>
        </div>
      </div>
      <div style="text-align:right; min-width:140px">
        <div style="font-weight:700" id="pending-${it.index}">${pending}</div>
        <div class="tiny-muted">Pending (live)</div>
      </div>
    `;
    stakeList.appendChild(node);
  });
}

function signingReady(){ return !!(signer && userAddress && stakingContract); }

/************************************************************************
 * Actions: Approve, Stake, Claim, Withdraw
 ************************************************************************/
approveBtn.addEventListener('click', async ()=>{
  if(!signingReady()){ writeLog('Connect wallet first'); return; }
  try{
    approveBtn.disabled = true;
    writeLog('Approving token allowance for staking contract...');
    const max = ethers.constants.MaxUint256;
    const tx = await tokenContract.approve(CONFIG.STAKING_CONTRACT_ADDRESS, max);
    writeLog('Approve tx sent:', tx.hash);
    await tx.wait();
    writeLog('Approved.');
  }catch(e){ writeLog('Approve error:', e.message || e); }
  approveBtn.disabled = false;
});

stakeBtn.addEventListener('click', async ()=>{
  if(!signingReady()){ writeLog('Connect wallet first'); return; }
  const amt = Number(stakeAmount.value);
  if(!amt || amt <= 0){ writeLog('Enter valid amount'); return; }
  const ref = referrerInput.value.trim();
  try{
    stakeBtn.disabled = true; stakeSpinner.style.display = 'inline-block';
    writeLog('Staking', amt, 'NAVAA ...');
    const wei = decimalsToWei(amt);
    const refAddr = (ref && ethers.utils.isAddress(ref)) ? ref : ethers.constants.AddressZero;
    const tx = await stakingContract.stakeTokens(wei, refAddr);
    writeLog('Stake tx:', tx.hash);
    await tx.wait();
    writeLog('Staking confirmed');
    await refreshAll();
  }catch(e){
    writeLog('Stake failed:', e.message || e);
  }finally{
    stakeBtn.disabled = false; stakeSpinner.style.display = 'none';
  }
});

claimBtn.addEventListener('click', async ()=>{
  if(!signingReady()){ writeLog('Connect wallet first'); return; }
  const indices = getSelectedIndices();
  if(indices.length === 0){ writeLog('Select stakes to claim'); return; }
  try{
    claimBtn.disabled = true; document.getElementById('claimSpinner').style.display = 'inline-block';
    writeLog('Claiming rewards for', indices);
    const tx = await stakingContract.claimStakingRewards(indices);
    writeLog('Claim tx:', tx.hash);
    await tx.wait();
    writeLog('Claim confirmed');
    await refreshAll();
  }catch(e){ writeLog('Claim failed:', e.message || e); }
  finally{ claimBtn.disabled = false; document.getElementById('claimSpinner').style.display = 'none'; }
});

withdrawBtn.addEventListener('click', async ()=>{
  if(!signingReady()){ writeLog('Connect wallet first'); return; }
  const indices = getSelectedIndices();
  if(indices.length === 0){ writeLog('Select stakes to withdraw principal'); return; }
  try{
    withdrawBtn.disabled = true; document.getElementById('withdrawSpinner').style.display = 'inline-block';
    writeLog('Withdrawing principal for', indices);
    const tx = await stakingContract.withdrawPrincipal(indices);
    writeLog('Withdraw tx:', tx.hash);
    await tx.wait();
    writeLog('Withdraw confirmed');
    await refreshAll();
  }catch(e){ writeLog('Withdraw failed:', e.message || e); }
  finally{ withdrawBtn.disabled = false; document.getElementById('withdrawSpinner').style.display = 'none'; }
});

function getSelectedIndices(){
  const arr = [];
  const boxes = document.querySelectorAll('.stake-list input[type="checkbox"]');
  boxes.forEach(cb=>{
    if(cb.checked) arr.push(Number(cb.dataset.index));
  });
  return arr;
}

refreshBtn.addEventListener('click', async ()=>{ refreshBtn.disabled = true; await refreshAll(); refreshBtn.disabled = false; });
document.getElementById('clearLog').addEventListener('click', ()=>{ logEl.textContent = ''; });

/************************************************************************
 * Boot
 ************************************************************************/
(function boot(){
  initModal();
  connectBtn.addEventListener('click', async ()=>{
    if(!userAddress) await connectWallet();
    else writeLog('Already connected');
  });

  document.getElementById('tokenAddrShort').textContent = shortAddr(CONFIG.TOKEN_CONTRACT_ADDRESS);
  document.getElementById('contractAddrShort').textContent = shortAddr(CONFIG.STAKING_CONTRACT_ADDRESS);
  writeLog('UI ready — connect wallet to begin');
})();

// read-only provider to fetch management wallet & stake duration
(async ()=>{
  try{
    const readonlyProvider = new ethers.providers.JsonRpcProvider(CONFIG.RPC, CONFIG.CHAIN_ID);
    const readStaking = new ethers.Contract(CONFIG.STAKING_CONTRACT_ADDRESS, CONFIG.STAKING_ABI, readonlyProvider);
    const management = await readStaking.managementWallet();
    managementWalletEl.textContent = `Mgmt: ${shortAddr(management)}`;
    try{
      const sd = await readStaking.STAKE_DURATION();
      window.__STAKE_DURATION__ = sd.toNumber();
      writeLog('Stake duration:', window.__STAKE_DURATION__, 'seconds');
    }catch(e){}
  }catch(e){}
})();
