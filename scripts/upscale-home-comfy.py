import json,time,urllib.request,shutil
from pathlib import Path
base='http://127.0.0.1:8188'
root=Path(__file__).resolve().parents[1]
comfy=Path('C:/Ai/ComfyUI-aki/ComfyUI-aki-v3/ComfyUI')
out=root/'output/comfy-hd';out.mkdir(exist_ok=True)
for attempt in range(90):
 try:
  urllib.request.urlopen(base+'/system_stats');break
 except Exception:time.sleep(2)
else:raise RuntimeError('ComfyUI startup timed out')
for name in ['paper-hero','paper-craft','paper-tryon','paper-wall']:
 filename='zh-'+name+'.png';shutil.copy2(root/'output/studio-redesign/assets'/f'{name}.png',comfy/'input'/filename)
 workflow={'1':{'class_type':'LoadImage','inputs':{'image':filename}},'2':{'class_type':'UpscaleModelLoader','inputs':{'model_name':'RealESRGAN_x2plus.pth'}},'3':{'class_type':'ImageUpscaleWithModel','inputs':{'upscale_model':['2',0],'image':['1',0]}},'4':{'class_type':'SaveImage','inputs':{'images':['3',0],'filename_prefix':'zh-hd/'+name}}}
 (out/f'{name}-workflow.json').write_text(json.dumps(workflow,indent=2),encoding='utf8')
 req=urllib.request.Request(base+'/prompt',data=json.dumps({'prompt':workflow}).encode(),headers={'Content-Type':'application/json'})
 result=json.load(urllib.request.urlopen(req));pid=result['prompt_id'];print(name,pid,flush=True)
 for attempt in range(300):
  history=json.load(urllib.request.urlopen(base+'/history/'+pid))
  if pid in history:
   entry=history[pid]
   if entry.get('status',{}).get('status_str')=='error':raise RuntimeError(str(entry))
   for img in entry['outputs']['4']['images']:
    shutil.copy2(comfy/'output'/img['subfolder']/img['filename'],out/f'{name}-2x.png')
   (out/f'{name}-history.json').write_text(json.dumps(entry,indent=2),encoding='utf8');print(name,'complete',flush=True);break
  time.sleep(2)
 else:raise RuntimeError('Upscale timeout')
