import json
import os
import subprocess
import sys

# -----------------------------------------------------------------------------
# configuration
# -----------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(BASE_DIR, "resources", "config.json")

def load_config():
    """
    loads json config and overrides with env vars.
    pattern: section__key (e.g. scp__host overrides config['scp']['host'])
    """
    if not os.path.exists(CONFIG_PATH):
        # fallback for checking if user put it in root during setup
        return None

    with open(CONFIG_PATH, 'r') as f:
        config = json.load(f)

    # env override logic
    for env_key, env_val in os.environ.items():
        key_lower = env_key.lower()

        # 1. handle nested overrides (e.g. scp__host -> config['scp']['host'])
        if "__" in key_lower:
            try:
                section, sub_key = key_lower.split("__", 1)
                if section in config and isinstance(config[section], dict):
                    # only override if section exists to avoid pollution
                    config[section][sub_key] = env_val
            except ValueError:
                continue # ignore malformed keys

        # 2. handle root overrides (e.g. active_provider -> config['active_provider'])
        elif key_lower in config:
            config[key_lower] = env_val

    return config

# -----------------------------------------------------------------------------
# publish actions
# -----------------------------------------------------------------------------

def scp_publish(config, local_path, visual_name):
    """
    handles deployment via ssh/scp.
    dependencies: system 'ssh' and 'scp' binaries.
    """
    host = config.get('host')
    dest_base = config.get('destination_path')

    if not host or not dest_base:
        raise ValueError("scp provider requires 'host' and 'destination_path' in config.")

    # paths
    remote_dir = f"{dest_base}/{visual_name}"
    remote_file = f"{remote_dir}/index.html"

    print(f"--> [scp] connecting to {host}...")

    # 1. create remote directory
    # mkdir -p ensures it doesn't fail if dir exists
    subprocess.check_call(['ssh', host, f'mkdir -p {remote_dir}'])

    # 2. copy file
    print(f"--> [scp] uploading {os.path.basename(local_path)}...")
    subprocess.check_call(['scp', local_path, f'{host}:{remote_file}'])

    # 3. set permissions (read-only public)
    subprocess.check_call(['ssh', host, f'chmod 444 {remote_file}'])

    return remote_file

def s3_publish(config, local_path, visual_name):
    """
    handles deployment via aws s3.
    dependencies: 'boto3' (imported lazily to avoid forcing install for scp users).
    """
    try:
        import boto3
    except ImportError:
        print("error: 'boto3' is required for s3 deployment. pip install boto3")
        sys.exit(1)

    bucket_name = config.get('bucket')
    region = config.get('region', 'us-east-1')
    acl = config.get('acl', 'public-read')

    if not bucket_name:
        raise ValueError("s3 provider requires 'bucket' in config.")

    s3 = boto3.client('s3', region_name=region)
    key = f"{visual_name}/index.html"

    print(f"--> [s3] uploading to {bucket_name}/{key}...")

    with open(local_path, 'rb') as f:
        s3.put_object(
            Bucket=bucket_name,
            Key=key,
            Body=f,
            ContentType='text/html',
            ACL=acl
        )

    return f"s3://{bucket_name}/{key}"

# -----------------------------------------------------------------------------
# main
# -----------------------------------------------------------------------------

def main():
    if len(sys.argv) < 3:
        print("usage: python publish.py <local_file_path> <visual_name_slug>")
        sys.exit(1)

    local_path = sys.argv[1]
    visual_name = sys.argv[2]

    # 1. load full config (w/ env overrides)
    full_config = load_config()
    if not full_config:
        print(f"error: config not found at {CONFIG_PATH}")
        sys.exit(1)

    # 2. determine provider
    provider_name = full_config.get('active_provider', 'scp')

    # 3. get provider specific config
    provider_config = full_config.get(provider_name)
    if not provider_config:
        print(f"error: configuration for provider '{provider_name}' is missing in json.")
        sys.exit(1)

    try:
        if provider_name == 'scp':
            result = scp_publish(provider_config, local_path, visual_name)
        elif provider_name == 's3':
            result = s3_publish(provider_config, local_path, visual_name)
        else:
            print(f"error: unknown provider '{provider_name}'")
            sys.exit(1)

        # success message
        url_base = provider_config.get('public_url_base')

        print("\nsuccess: visual published.")
        if url_base:
            # ensure url doesn't double slash if base ends with /
            if url_base.endswith('/'):
                print(f"url: {url_base}{visual_name}/")
            else:
                print(f"url: {url_base}/{visual_name}/")
        else:
            print(f"location: {result}")

    except Exception as e:
        print(f"\nfailure: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
